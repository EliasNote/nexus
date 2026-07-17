import { useCallback, useState } from "react";
import {
  checkGitRepo,
  initGitRepo,
  setGitRemote,
  syncGitRepo,
} from "./gitSync";
import type { VaultStorage } from "../../types";
import { useCloudStore } from "@/hooks/useCloudStore";
import type { EncryptedVault } from "@/types/vault";
import { useLocalFile } from "../local-file/useLocalFile";

export function useGitRepository(): VaultStorage {
  const [isLoading, setIsLoading] = useState(false);
  const localFile = useLocalFile();

  const isGitRepo = useCallback(async () => {
    const vaultPath = useCloudStore.getState().vaultPath;

    if (!vaultPath) return false;

    const status = await checkGitRepo(vaultPath);
    return status.isGitRepo;
  }, []);

  const initialize = useCallback(async (remoteUrl: string) => {
    const vaultPath = useCloudStore.getState().vaultPath;

    if (!vaultPath) {
      throw new Error("Nenhum diretório selecionado.");
    }

    setIsLoading(true);

    try {
      const status = await checkGitRepo(vaultPath);

      if (!status.isGitRepo) {
        await initGitRepo(vaultPath);
      }

      await setGitRemote(vaultPath, remoteUrl);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sync = useCallback(async (vaultPath: string) => {
    if (!vaultPath) {
      throw new Error("Nenhum diretório selecionado.");
    }

    setIsLoading(true);

    try {
      await syncGitRepo(vaultPath);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upload = useCallback(
    async (vault: EncryptedVault) => {
      const vaultPath = useCloudStore.getState().vaultPath;

      if (!vaultPath) {
        throw new Error("Nenhum diretório selecionado.");
      }

      await localFile.upload(vault);
      await sync(vaultPath);
    },
    [localFile, sync],
  );

  return {
    isLoading,
    initialize,
    exists: async () => {
      const vaultExists = await localFile.exists();
      return vaultExists ? "git" : null;
    },
    isRepo: isGitRepo,
    download: async () => {
      const vaultPath = useCloudStore.getState().vaultPath;

      if (!vaultPath) {
        throw new Error("Nenhum diretório selecionado.");
      }

      await sync(vaultPath);
      return localFile.download();
    },
    upload,
    delete: async () => localFile.delete(),
  };
}
