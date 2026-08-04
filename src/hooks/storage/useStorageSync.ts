import { useCallback } from "react";
import type { EncryptedVaultEnvelope } from "@/types/vault";
import { useCloudStore } from "@/hooks/useCloudStore";
import { useGoogleDrive } from "./adapters/google-drive/useGoogleDrive";
import { useLocalFile } from "./adapters/local-file/useLocalFile";
import type { StorageProvider, VaultStorage } from "./types";
import { useGitRepository } from "./adapters/git-repository/useGitRepository";

export const useStorageSync = () => {
  const provider = useCloudStore((state) => state.activeProvider);
  const setProvider = useCloudStore((state) => state.setActiveProvider);

  const googleStorage = useGoogleDrive();
  const localStorage = useLocalFile();
  const gitStorage = useGitRepository();


  const getStorage = useCallback((targetProvider?: StorageProvider): VaultStorage | null => {
    const active = targetProvider ?? provider;
    switch (active) {
      case "google":
        return googleStorage;
      case "local":
        return localStorage;
      case "git":
        return gitStorage;
      default:
        return null;
    }
  }, [provider, googleStorage, localStorage, gitStorage]);

  const connect = useCallback(
    async (targetProvider: StorageProvider): Promise<boolean> => {
      if (targetProvider === "google") {
        const result = await googleStorage.session.connect();

        if (!result) {
          return false;
        }

        setProvider(targetProvider);
        return true;
      }

      if (targetProvider === "git") {
        const isRepository = await gitStorage.isRepo?.();

        if (!isRepository) {
          return false;
        }

        setProvider(targetProvider);
        return true;
      }

      const { vaultPath } = useCloudStore.getState();

      if (!vaultPath) {
        return false;
      }

      setProvider(targetProvider);
      return true;
    },
    [gitStorage, googleStorage, setProvider],
  );

  const refresh = useCallback(async () => {
    if (provider !== "google") {
      return null;
    }

    return googleStorage.session.refresh();
  }, [provider, googleStorage]);

  const disconnect = useCallback(() => {
    if (provider === "google") {
      googleStorage.session.disconnect();
    }
    useCloudStore.getState().clearSession();
  }, [provider, googleStorage]);

  const exists = useCallback(async () => {
    return getStorage()?.exists() ?? null;
  }, [getStorage]);

  const download = useCallback(async () => {
    const storage = getStorage();

    if (!storage) {
      throw new Error("Nenhum storage foi selecionado.");
    }

    return storage.download();
  }, [getStorage]);

  const upload = useCallback(
    async (vault: EncryptedVaultEnvelope) => {
      const storage = getStorage();

      if (!storage) {
        throw new Error("Nenhum storage foi selecionado.");
      }

      return storage.upload(vault);
    },
    [getStorage],
  );

  const remove = useCallback(async () => {
    const storage = getStorage();

    if (!storage) {
      throw new Error("Nenhum storage foi selecionado.");
    }

    await storage.delete();
  }, [getStorage]);

  return {
    provider,
    setProvider,
    connect,
    refresh,
    disconnect,
    exists,
    download,
    upload,
    remove,
  };
};
