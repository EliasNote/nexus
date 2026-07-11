import { useCallback, useState } from "react";
import {
  checkGitRepo,
  gitCommitAll,
  gitPush,
  initGitRepo,
  setGitRemote,
  syncGitRepo,
} from "./gitSync";
import type { GitRepository } from "../../types";

export function useGitRepository(
  directory: string | null,
): GitRepository {
  const [isLoading, setIsLoading] = useState(false);

  const isGitRepo = useCallback(async () => {
    if (!directory) {
      return false;
    }

    const status = await checkGitRepo(directory);

    return status.isGitRepo;
  }, [directory]);

  const initialize = useCallback(
    async (remoteUrl: string) => {
      if (!directory) {
        throw new Error(
          "Nenhum diretório Git foi selecionado.",
        );
      }

      setIsLoading(true);

      try {
        const status = await checkGitRepo(directory);

        if (!status.isGitRepo) {
          await initGitRepo(directory);
        }

        await setGitRemote(directory, remoteUrl);
        await gitCommitAll(directory);
        await gitPush(directory);
      } finally {
        setIsLoading(false);
      }
    },
    [directory],
  );

  const sync = useCallback(async () => {
    if (!directory) {
      throw new Error(
        "Nenhum diretório Git foi selecionado.",
      );
    }

    setIsLoading(true);

    try {
      await syncGitRepo(directory);
    } finally {
      setIsLoading(false);
    }
  }, [directory]);

  return {
    directory,
    isLoading,
    isGitRepo,
    initialize,
    sync,
  };
}
