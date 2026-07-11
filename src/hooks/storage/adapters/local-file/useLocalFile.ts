import {
  BaseDirectory,
  exists as fileExists,
  mkdir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { EncryptedVault } from "@/types/vault";
import type {
  VaultMetadata,
  VaultStorage,
} from "../../types";

const VAULT_DIRECTORY = "Nexus";
const VAULT_PATH = "Nexus/nexus-vault.json";

async function exists(): Promise<VaultMetadata | null> {
  const vaultExists = await fileExists(VAULT_PATH, {
    baseDir: BaseDirectory.Document,
  });

  return vaultExists ? { id: VAULT_PATH } : null;
}

async function download(): Promise<EncryptedVault> {
  const content = await readTextFile(VAULT_PATH, {
    baseDir: BaseDirectory.Document,
  });

  if (!content) {
    throw new Error("Nenhum cofre local foi encontrado.");
  }

  try {
    return JSON.parse(content) as EncryptedVault;
  } catch {
    throw new Error("O cofre local está inválido.");
  }
}

async function upload(
  vault: EncryptedVault,
): Promise<VaultMetadata> {
  await mkdir(VAULT_DIRECTORY, {
    baseDir: BaseDirectory.Document,
    recursive: true,
  });

  await writeTextFile(
    VAULT_PATH,
    JSON.stringify(vault),
    {
      baseDir: BaseDirectory.Document,
    },
  );

  return {
    id: VAULT_PATH,
    name: "nexus-vault.json",
    mimeType: "application/json",
  };
}

async function deleteVault(): Promise<void> {
  if (await fileExists(VAULT_PATH, {
    baseDir: BaseDirectory.Document,
  })) {
    await remove(VAULT_PATH, {
      baseDir: BaseDirectory.Document,
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
