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
import { join } from "@tauri-apps/api/path";

const VAULT_DIRECTORY = "Nexus";
const VAULT_NAME = "nexus-vault.json";
const DEFAULT_VAULT_PATH = `${VAULT_DIRECTORY}/${VAULT_NAME}`;

export function useLocalFile(): VaultStorage {
  async function resolvePath(): Promise<{ path: string; baseDir?: BaseDirectory }> {
    const { vaultPath } = useCloudStore.getState();

    if (vaultPath) {
      const fullPath = await join(vaultPath, VAULT_NAME);
      return { path: fullPath };
    }

    return { path: DEFAULT_VAULT_PATH, baseDir: BaseDirectory.Document };
  }

  async function exists(): Promise<string | null> {
    const { path, baseDir } = await resolvePath();
    const vaultExists = await fileExists(path, { baseDir });
    return vaultExists ? "local" : null;
  }

  async function download(): Promise<EncryptedVault> {
    const { path, baseDir } = await resolvePath();
    const content = await readTextFile(path, { baseDir });

    if (!content.trim()) {
      throw new Error("Nenhum cofre foi encontrado.");
    }

    try {
      return JSON.parse(content) as EncryptedVault;
    } catch {
      throw new Error("O cofre local está inválido.");
    }
  }

  async function upload(vault: EncryptedVault): Promise<void> {
    const { path, baseDir } = await resolvePath();
    const { vaultPath } = useCloudStore.getState();

    if (!vaultPath) {
      await mkdir(VAULT_DIRECTORY, {
        baseDir: BaseDirectory.Document,
        recursive: true,
      });
    }

    await writeTextFile(path, JSON.stringify(vault), { baseDir });
  }

  async function deleteVault(): Promise<void> {
    const { path, baseDir } = await resolvePath();
    if (await fileExists(path, { baseDir })) {
      await remove(path, { baseDir });
    }
  }
  return {
    exists,
    download,
    upload,
    delete: deleteVault,
  };
}
