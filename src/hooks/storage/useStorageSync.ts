import { useCallback } from "react";
import { useCloudStore } from "@/hooks/useCloudStore";
import type { EncryptedVault } from "@/types/vault";
import { useGoogleStorage } from "./providers/google/useGoogleStorage";
import { useLocalStorageProvider } from "./providers/local/useLocalStorageProvider";

export const useStorageSync = () => {
  const activeProvider = useCloudStore((state) => state.activeProvider);
  const setActiveProvider = useCloudStore((state) => state.setActiveProvider);

  const googleService = useGoogleStorage();
  const localService = useLocalStorageProvider();

  const services = {
    google: googleService,
    local: localService,
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
  }, [activeProvider]);

  const uploadVault = useCallback(
    async (content: EncryptedVault) => {
      return getActiveService()?.uploadVault(content) ?? null;
    },
    [activeProvider],
  );

  const disconnect = useCallback(() => {
    getActiveService()?.disconnect();
  }, [activeProvider]);

  const refresh = useCallback(async () => {
    return getActiveService()?.refresh() ?? null;
  }, [activeProvider]);

  const find = useCallback(async () => {
    return getActiveService()?.find() ?? null;
  }, [activeProvider]);

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
  };
};
