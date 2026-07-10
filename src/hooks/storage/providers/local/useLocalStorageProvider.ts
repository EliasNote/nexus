import { isTauri } from "@tauri-apps/api/core";
import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { useCloudStore } from "@/hooks/useCloudStore";
import type { EncryptedVault } from "@/types/vault";
import type { StorageProviderInterface } from "../../types";

const LOCAL_VAULT_DIRECTORY = "Nexus";
const LOCAL_VAULT_PATH = "Nexus/nexus-vault.json";
const WEB_VAULT_KEY = "nexus.encrypted-vault.v1";
const LOCAL_SESSION_TOKEN = "local";

async function localVaultExists(): Promise<boolean> {
  if (!isTauri()) {
    return localStorage.getItem(WEB_VAULT_KEY) !== null;
  }

  return exists(LOCAL_VAULT_PATH, {
    baseDir: BaseDirectory.Document,
  });
}

async function readLocalVault(): Promise<EncryptedVault> {
  const serializedVault = isTauri()
    ? await readTextFile(LOCAL_VAULT_PATH, {
        baseDir: BaseDirectory.Document,
      })
    : localStorage.getItem(WEB_VAULT_KEY);

  if (!serializedVault) {
    throw new Error("Nenhum cofre local foi encontrado.");
  }

  try {
    return JSON.parse(serializedVault) as EncryptedVault;
  } catch {
    throw new Error("O cofre local está corrompido ou é inválido.");
  }
}

async function writeLocalVault(vault: EncryptedVault): Promise<void> {
  const serializedVault = JSON.stringify(vault);

  if (!isTauri()) {
    localStorage.setItem(WEB_VAULT_KEY, serializedVault);
    return;
  }

  await mkdir(LOCAL_VAULT_DIRECTORY, {
    baseDir: BaseDirectory.Document,
    recursive: true,
  });

  await writeTextFile(LOCAL_VAULT_PATH, serializedVault, {
    baseDir: BaseDirectory.Document,
  });
}

async function removeLocalVault(): Promise<void> {
  if (!isTauri()) {
    localStorage.removeItem(WEB_VAULT_KEY);
    return;
  }

  if (await localVaultExists()) {
    await remove(LOCAL_VAULT_PATH, {
      baseDir: BaseDirectory.Document,
    });
  }
}

export function useLocalStorageProvider(): StorageProviderInterface {
  const token = useCloudStore((state) => state.accessToken);
  const setAccessToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const clearSession = useCloudStore((state) => state.clearSession);

  const connect = () => {
    setAccessToken(LOCAL_SESSION_TOKEN);
    setExpiresIn(null);
    setIsTokenValid(true);
  };

  const login = () => {
    connect();
  };

  const loginWithPromise = async (): Promise<string> => {
    connect();
    return LOCAL_SESSION_TOKEN;
  };

  const refresh = async (): Promise<string> => {
    connect();
    return LOCAL_SESSION_TOKEN;
  };

  const find = async () => {
    return (await localVaultExists()) ? { id: LOCAL_VAULT_PATH } : null;
  };

  const download = async (): Promise<EncryptedVault> => {
    return readLocalVault();
  };

  const uploadVault = async (vault: EncryptedVault) => {
    await writeLocalVault(vault);

    return {
      id: LOCAL_VAULT_PATH,
      name: "nexus-vault.json",
      mimeType: "application/json",
    };
  };

  const deleteVault = async (): Promise<void> => {
    await removeLocalVault();
  };

  const disconnect = () => {
    clearSession();
  };

  return {
    token,
    refresh,
    isLoading: false,
    find,
    login,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
    deleteVault,
  };
}
