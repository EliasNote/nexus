import { useCallback } from "react";
import { useCloudStore } from "./useCloudStore";
import { useGoogle } from "./useGoogle";
import { useGitHub } from "./useGithub";

export const useCloudSync = () => {
  const activeProvider = useCloudStore((state) => state.activeProvider);
  const setActiveProvider = useCloudStore((state) => state.setActiveProvider);
  const token = useCloudStore((state) => state.accessToken);

  const googleService = useGoogle();
  const githubService = useGitHub();

  const services = {
    google: googleService,
    github: githubService,
  };

  const getActiveService = () => {
    const active = useCloudStore.getState().activeProvider;
    return active ? services[active] : null;
  };

  const login = useCallback(() => {
    getActiveService()?.login();
  }, [activeProvider]);

  const loginWithPromise = useCallback(async () => {
    return getActiveService()?.loginWithPromise() ?? null;
  }, [activeProvider]);

  const download = useCallback(async () => {
    return getActiveService()?.download() ?? null;
  }, [activeProvider, token]);

  const uploadVault = useCallback(
    async (content: string) => {
      return getActiveService()?.uploadVault(content) ?? null;
    },
    [activeProvider, token],
  );

  const disconnect = useCallback(() => {
    getActiveService()?.disconnect();
  }, [activeProvider]);

  const refresh = useCallback(async () => {
    return getActiveService()?.refresh() ?? null;
  }, [activeProvider]);

  const find = useCallback(async () => {
    return getActiveService()?.find() ?? null;
  }, [activeProvider, token]);

  const needsRepoFix = useCloudStore((state) => state.needsRepoFix);
  const setNeedsRepoFix = useCloudStore((state) => state.setNeedsRepoFix);

  const currentService = activeProvider ? services[activeProvider] : null;

  return {
    provider: activeProvider,
    setProvider: setActiveProvider,
    isLoading: currentService ? currentService.isLoading : false,

    login,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
    refresh,
    find,
    needsRepoFix,
    setNeedsRepoFix,
    loginRepoNotFound: githubService.loginRepoNotFound,
  };
};
