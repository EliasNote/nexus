import { useCallback, useState } from "react";
import {
  checkGitRepo,
  gitCommitAll,
  gitPull,
  gitPush,
  initGitRepo,
  setGitRemote,
  syncGitRepo,
} from "./storage/providers/local/gitSync";
import type { GitRepoStatus, GitSyncStatus } from "@/types/types";

export function useGitSync(vaultPath: string | null) {
  const [status, setStatus] = useState<GitSyncStatus>("idle");
  const [repoStatus, setRepoStatus] = useState<GitRepoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requireVaultPath = useCallback(() => {
    if (!vaultPath) {
      throw new Error("Escolha uma pasta do Nexus primeiro.");
    }

    return vaultPath;
  }, [vaultPath]);

  const refreshStatus = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("checking");
    setError(null);

    try {
      const result = await checkGitRepo(cwd);
      setRepoStatus(result);
      setStatus("idle");
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao verificar Git.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [requireVaultPath]);

  const initializeRepo = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("checking");
    setError(null);

    try {
      await initGitRepo(cwd);
      await refreshStatus();
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao iniciar Git.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [refreshStatus, requireVaultPath]);

  const configureRemote = useCallback(
    async (remoteUrl: string) => {
      const cwd = requireVaultPath();

      setStatus("checking");
      setError(null);

      try {
        await setGitRemote(cwd, remoteUrl);
        await refreshStatus();
        setStatus("success");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao configurar remote.";
        setError(message);
        setStatus("error");
        throw err;
      }
    },
    [refreshStatus, requireVaultPath],
  );

  const pull = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("pulling");
    setError(null);

    try {
      await gitPull(cwd);
      await refreshStatus();
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao baixar alterações.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [refreshStatus, requireVaultPath]);

  const commit = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("committing");
    setError(null);

    try {
      await gitCommitAll(cwd);
      await refreshStatus();
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar alterações.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [refreshStatus, requireVaultPath]);

  const push = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("pushing");
    setError(null);

    try {
      await gitPush(cwd);
      await refreshStatus();
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar alterações.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [refreshStatus, requireVaultPath]);

  const sync = useCallback(async () => {
    const cwd = requireVaultPath();

    setStatus("pulling");
    setError(null);

    try {
      await syncGitRepo(cwd);
      await refreshStatus();
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao sincronizar Git.";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [refreshStatus, requireVaultPath]);

  return {
    status,
    repoStatus,
    error,
    refreshStatus,
    initializeRepo,
    configureRemote,
    pull,
    commit,
    push,
    sync,
  };
}
