import { useCallback } from "react";
import type { EncryptedVault } from "@/types/vault";
import { useCloudStore } from "@/hooks/useCloudStore";
import { useGoogleDrive } from "./adapters/google-drive/useGoogleDrive";
import { useLocalFile } from "./adapters/local-file/useLocalFile";
import type { VaultStorage } from "./types";

export const useStorageSync = () => {
  const provider = useCloudStore(
    (state) => state.activeProvider,
  );

  const setProvider = useCloudStore(
    (state) => state.setActiveProvider,
  );

  const googleStorage = useGoogleDrive();
  const localStorage = useLocalFile();

  const getStorage = useCallback((): VaultStorage | null => {
    if (provider === "google") {
      return googleStorage;
    }

    if (provider === "local") {
      return localStorage;
    }

    return null;
  }, [provider, googleStorage, localStorage]);

  const connect = useCallback(async () => {
    if (provider !== "google") {
      return null;
    }

    return googleStorage.session.connect();
  }, [provider, googleStorage]);

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
    async (vault: EncryptedVault) => {
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
    isLoading: getStorage()?.isLoading ?? false,
    connect,
    refresh,
    disconnect,
    exists,
    download,
    upload,
    remove,
  };
};
