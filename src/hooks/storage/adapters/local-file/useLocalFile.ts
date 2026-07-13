import {
  BaseDirectory,
  exists as fileExists,
  mkdir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { EncryptedVault } from "@/types/vault";
import type { VaultStorage } from "../../types";
import { useCloudStore } from "@/hooks/useCloudStore";

const VAULT_DIRECTORY = "Nexus";
const VAULT_NAME = "nexus-vault.json";
const VAULT_PATH = `${VAULT_DIRECTORY}/${VAULT_NAME}`;

function getBaseDir(): BaseDirectory {
  return BaseDirectory.Document;
}

function resolvePath(): string {
  const { activeProvider, vaultPath } =
    useCloudStore.getState();

  if (activeProvider === "git" && vaultPath) {
    return `${vaultPath}/${VAULT_NAME}`;
  }

  return VAULT_PATH;
}

function isGitStorage(): boolean {
  const { activeProvider, vaultPath } =
    useCloudStore.getState();

  return activeProvider === "git" && Boolean(vaultPath);
}

async function exists(): Promise<string | null> {
  const vaultExists = await fileExists(resolvePath(), {
    baseDir: getBaseDir(),
  });

  return vaultExists ? "local" : null;
}

async function download(): Promise<EncryptedVault> {
  const path = resolvePath();
  const content = await readTextFile(path, {
    baseDir: getBaseDir(),
  });

  if (!content.trim()) {
    throw new Error("Nenhum cofre foi encontrado.");
  }

  try {
    return JSON.parse(content) as EncryptedVault;
  } catch {
    throw new Error("O cofre local está inválido.");
  }
}

async function upload(
  vault: EncryptedVault,
): Promise<void> {
  if (!isGitStorage()) {
    await mkdir(VAULT_DIRECTORY, {
      baseDir: getBaseDir(),
      recursive: true,
    });
  }

  await writeTextFile(
    resolvePath(),
    JSON.stringify(vault),
    {
      baseDir: getBaseDir(),
    },
  );
}

async function deleteVault(): Promise<void> {
  const vaultPath = resolvePath();

  if (
    await fileExists(vaultPath, {
      baseDir: getBaseDir(),
    })
  ) {
    await remove(vaultPath, {
      baseDir: getBaseDir(),
    });
  }
}

export function useLocalFile(): VaultStorage {
  return {
    isLoading: false,
    exists,
    download,
    upload,
    delete: deleteVault,
  };
}
