import { create } from "zustand";
import { wrap } from "comlink";
import type { CryptoService } from "../utils/worker";
import type { EncryptedVault, VaultSummarizedData } from "@/types/vault";
import type { StorageProvider } from "./storage/types";

const worker = new Worker(new URL("../utils/worker.ts", import.meta.url), {
  type: "module",
});

export const cryptoService = wrap<CryptoService>(worker);

type CloudState = {
  vault: null | EncryptedVault;
  setVault: (vault: null | EncryptedVault) => void;
  summaryVault: null | VaultSummarizedData;
  setSummaryVault: (summary: VaultSummarizedData) => void;
  activeProvider: StorageProvider;
  setActiveProvider: (provider: StorageProvider) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  loginRepoNotFound?: () => void;
  setLoginRepoNotFound: (fn: () => void) => void;
  needsRepoFix: boolean;
  setNeedsRepoFix: (needsRepoFix: boolean) => void;
  clearSession: () => void;
  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;
  isTokenValid: boolean;
  setIsTokenValid: (isValid: boolean) => void;
  isPendingSync: boolean;
  setIsPendingSync: (isPendingSync: boolean) => void;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
};

export const useCloudStore = create<CloudState>()((set) => ({
  vault: null,
  setVault: (vault) => set({ vault: vault }),

  summaryVault: null,
  setSummaryVault: (summary) => set({ summaryVault: summary }),

  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),

  refreshToken: null,
  setRefreshToken: (token) => set({ refreshToken: token }),

  activeProvider: null,
  setActiveProvider: (provider) => set({ activeProvider: provider }),

  needsRepoFix: false,
  setNeedsRepoFix: (needsRepoFix) => set({ needsRepoFix }),

  loginRepoNotFound: undefined,
  setLoginRepoNotFound: (fn) => set({ loginRepoNotFound: fn }),

  clearSession: () => {
    cryptoService.destroyKey();
    set({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      isTokenValid: false,
      vault: null,
      summaryVault: null,
      activeProvider: null,
    });
  },

  expiresIn: null,
  setExpiresIn: (expiresIn) => set({ expiresIn }),

  isTokenValid: false,
  setIsTokenValid: (isValid) => set({ isTokenValid: isValid }),

  isPendingSync: false,
  setIsPendingSync: (isPendingSync) => set({ isPendingSync }),

  isSaving: false,
  setIsSaving: (isSaving) => set({ isSaving }),

  autoSaveInterval: 1,
  setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
}));
