import { Command } from "@tauri-apps/plugin-shell";
import type {
  GitRepoStatus,
  GitSyncResult,
} from "@/types/types";

async function runGit(
  directory: string,
  args: string[],
): Promise<string> {
  const command = Command.create("git", args, {
    cwd: directory,
  });

  const result = await command.execute();

  if (result.code !== 0) {
    throw new Error(
      result.stderr ||
        result.stdout ||
        "Erro ao executar Git.",
    );
  }

  return result.stdout;
}

async function tryRunGit(
  directory: string,
  args: string[],
): Promise<string | null> {
  try {
    return await runGit(directory, args);
  } catch {
    return null;
  }
}

export async function checkGitExists(): Promise<boolean> {
  try {
    const result = await Command.create(
      "git",
      ["--version"],
    ).execute();

    return result.code === 0;
  } catch {
    return false;
  }
}

export async function checkGitRepo(
  directory: string,
): Promise<GitRepoStatus> {
  const isInsideWorkTree = await tryRunGit(
    directory,
    ["rev-parse", "--is-inside-work-tree"],
  );

  if (isInsideWorkTree?.trim() !== "true") {
    return {
      isGitRepo: false,
      hasRemote: false,
    };
  }

  const branch = await tryRunGit(
    directory,
    ["branch", "--show-current"],
  );

  const remoteUrl = await tryRunGit(
    directory,
    ["remote", "get-url", "origin"],
  );

  return {
    isGitRepo: true,
    hasRemote: Boolean(remoteUrl?.trim()),
    branch: branch?.trim() || undefined,
    remoteUrl: remoteUrl?.trim() || undefined,
  };
}

export async function initGitRepo(
  directory: string,
): Promise<GitSyncResult> {
  const output = await runGit(directory, ["init"]);

  return {
    ok: true,
    message: "Repositório Git criado.",
    output,
  };
}

export async function setGitRemote(
  directory: string,
  remoteUrl: string,
): Promise<GitSyncResult> {
  const existingRemote = await tryRunGit(
    directory,
    ["remote", "get-url", "origin"],
  );

  const args = existingRemote?.trim()
    ? ["remote", "set-url", "origin", remoteUrl]
    : ["remote", "add", "origin", remoteUrl];

  const output = await runGit(directory, args);

  return {
    ok: true,
    message: "Remote configurado.",
    output,
  };
}

export async function gitPull(
  directory: string,
): Promise<GitSyncResult> {
  const output = await runGit(directory, [
    "pull",
    "--rebase",
    "origin",
    "main",
  ]);

  return {
    ok: true,
    message: "Alterações baixadas.",
    output,
  };
}

export async function gitCommitAll(
  directory: string,
  message = "Sync Nexus",
): Promise<GitSyncResult> {
  await runGit(directory, ["add", "."]);

  const status = await runGit(
    directory,
    ["status", "--porcelain"],
  );

  if (!status.trim()) {
    return {
      ok: true,
      message: "Nenhuma alteração para salvar.",
    };
  }

  const output = await runGit(directory, [
    "commit",
    "-m",
    message,
  ]);

  return {
    ok: true,
    message: "Alterações salvas no Git.",
    output,
  };
}

export async function gitPush(
  directory: string,
): Promise<GitSyncResult> {
  const output = await runGit(directory, [
    "push",
    "-u",
    "origin",
    "main",
  ]);

  return {
    ok: true,
    message: "Alterações enviadas.",
    output,
  };
}

export async function syncGitRepo(
  directory: string,
): Promise<GitSyncResult> {
  const repository = await checkGitRepo(directory);

  if (!repository.isGitRepo) {
    throw new Error(
      "Essa pasta ainda não é um repositório Git.",
    );
  }

  if (!repository.hasRemote) {
    throw new Error(
      "Nenhum remote origin configurado.",
    );
  }

  await gitPull(directory);
  await gitCommitAll(directory);
  await gitPush(directory);

  return {
    ok: true,
    message: "Sincronização Git concluída.",
  };
}
