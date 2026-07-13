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
  const [directory, setDirectory] = useState<string | null>(null);

  const isGitRepo = useCallback(async () => {
    const vaultPath = useCloudStore.getState().vaultPath;

    console.log("Vault Path", vaultPath)
    if (!vaultPath) return false;
    setDirectory(vaultPath);

    const status = await checkGitRepo(vaultPath);

    if (status.isGitRepo) {
      const store = useCloudStore.getState();
      store.setAccessToken("git");
      store.setIsTokenValid(true);
      store.setActiveProvider("git");
    }

    return status.isGitRepo;
  }, [directory]);

  const initialize = useCallback(async (remoteUrl: string) => {
    if (!directory) throw new Error("Nenhum diretório selecionado.");
    setIsLoading(true);
    try {
      const status = await checkGitRepo(directory);
      if (!status.isGitRepo) await initGitRepo(directory);

      await setGitRemote(directory, remoteUrl);

      const store = useCloudStore.getState();
      store.setAccessToken("git");
      store.setIsTokenValid(true);
      store.setActiveProvider("git");
    } finally {
      setIsLoading(false);
    }
  },
  [directory],
);

  const sync = useCallback(async (vaultPath: string) => {
    console.log("Sincronizando com o repositório Git...");
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

  const upload = useCallback(async (vault: EncryptedVault) => {
    const vaultPath =
      useCloudStore.getState().vaultPath;

    console.log("Antes do upload do git, vaultpath: ", vaultPath);

    if (!vaultPath) {
      throw new Error("Nenhum diretório selecionado.");
    }

    console.log("Antes do upload do git")
    await localFile.upload(vault);
    console.log("Antes do sync");
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
    isRepo: async () => {
      return await isGitRepo();
    },
    download: async () => {
      const vaultPath = useCloudStore.getState().vaultPath;
      await sync(vaultPath!);
      return localFile.download();
    },
    upload,
    delete: async () => localFile.delete(),
  };
}
