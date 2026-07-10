import type { GitRepoStatus, GitSyncResult } from "@/types/types";
import { Command } from "@tauri-apps/plugin-shell";

type RunGitOptions = {
  cwd: string;
  args: string[];
};

async function runGit({ cwd, args }: RunGitOptions): Promise<string> {
  const command = Command.create("git", args, {
    cwd,
  });

  const output = await command.execute();

  if (output.code !== 0) {
    throw new Error(output.stderr || output.stdout || "Erro ao executar git.");
  }

  return output.stdout;
}

async function tryRunGit(options: RunGitOptions): Promise<string | null> {
  try {
    return await runGit(options);
  } catch {
    return null;
  }
}

export async function checkGitRepo(cwd: string): Promise<GitRepoStatus> {
  const insideRepo = await tryRunGit({
    cwd,
    args: ["rev-parse", "--is-inside-work-tree"],
  });

  if (insideRepo?.trim() !== "true") {
    return {
      isGitRepo: false,
      hasRemote: false,
      hasChanges: false,
    };
  }

  const branch = await tryRunGit({
    cwd,
    args: ["branch", "--show-current"],
  });

  const remoteUrl = await tryRunGit({
    cwd,
    args: ["remote", "get-url", "origin"],
  });

  const status = await runGit({
    cwd,
    args: ["status", "--porcelain"],
  });

  return {
    isGitRepo: true,
    hasRemote: Boolean(remoteUrl?.trim()),
    hasChanges: status.trim().length > 0,
    branch: branch?.trim() || undefined,
    remoteUrl: remoteUrl?.trim() || undefined,
  };
}

export async function initGitRepo(cwd: string): Promise<GitSyncResult> {
  const output = await runGit({
    cwd,
    args: ["init"],
  });

  return {
    ok: true,
    message: "Repositório Git criado.",
    output,
  };
}

export async function setGitRemote(
  cwd: string,
  remoteUrl: string,
): Promise<GitSyncResult> {
  const existingRemote = await tryRunGit({
    cwd,
    args: ["remote", "get-url", "origin"],
  });

  const args = existingRemote?.trim()
    ? ["remote", "set-url", "origin", remoteUrl]
    : ["remote", "add", "origin", remoteUrl];

  const output = await runGit({
    cwd,
    args,
  });

  return {
    ok: true,
    message: "Remote configurado.",
    output,
  };
}

export async function gitPull(cwd: string): Promise<GitSyncResult> {
  const output = await runGit({
    cwd,
    args: ["pull", "--rebase", "origin", "main"],
  });

  return {
    ok: true,
    message: "Alterações remotas baixadas.",
    output,
  };
}

export async function gitCommitAll(
  cwd: string,
  message = "Sync Nexus",
): Promise<GitSyncResult> {
  await runGit({
    cwd,
    args: ["add", "."],
  });

  const status = await runGit({
    cwd,
    args: ["status", "--porcelain"],
  });

  if (!status.trim()) {
    return {
      ok: true,
      message: "Nenhuma alteração para salvar.",
    };
  }

  const output = await runGit({
    cwd,
    args: ["commit", "-m", message],
  });

  return {
    ok: true,
    message: "Alterações salvas no Git.",
    output,
  };
}

export async function gitPush(cwd: string): Promise<GitSyncResult> {
  const output = await runGit({
    cwd,
    args: ["push", "-u", "origin", "main"],
  });

  return {
    ok: true,
    message: "Alterações enviadas.",
    output,
  };
}

export async function syncGitRepo(cwd: string): Promise<GitSyncResult> {
  const repo = await checkGitRepo(cwd);

  if (!repo.isGitRepo) {
    throw new Error("Essa pasta ainda não é um repositório Git.");
  }

  if (!repo.hasRemote) {
    throw new Error("Nenhum remote origin configurado.");
  }

  await gitPull(cwd);
  await gitCommitAll(cwd);
  await gitPush(cwd);

  return {
    ok: true,
    message: "Sincronização Git concluída.",
  };
}
