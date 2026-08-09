import { create } from "zustand";
import { wrap } from "comlink";
import type { CryptoService } from "../utils/worker";
import type { CloudState } from "./types";

const worker = new Worker(new URL("../utils/worker.ts", import.meta.url), {
  type: "module",
});

export const cryptoService = wrap<CryptoService>(worker);

export const useCloudStore = create<CloudState>(
  (set) => ({
    activeProvider: null,

    setActiveProvider: (provider) => {
      set({ activeProvider: provider });
    },

    vault: null,

    setVault: (vault) => {
      set({ vault });
    },

    vaultPath: null,

    setVaultPath: (vaultPath) => {
      set({ vaultPath });
    },

    summaryVault: null,

    setSummaryVault: (summaryVault) => {
      set({ summaryVault });
    },

    accessToken: null,

    setAccessToken: (accessToken) => {
      set({ accessToken });
    },

    expiresIn: null,

    setExpiresIn: (expiresIn) => {
      set({ expiresIn });
    },

    isTokenValid: false,

    setIsTokenValid: (isTokenValid) => {
      set({ isTokenValid });
    },

    isPendingSync: false,

    setIsPendingSync: (isPendingSync) => {
      set({ isPendingSync });
    },

    isSaving: false,

    setIsSaving: (isSaving) => {
      set({ isSaving });
    },

    autoSaveInterval: 1,

    setAutoSaveInterval: (autoSaveInterval) => {
      set({ autoSaveInterval });
    },

    clearSession: () => {
      cryptoService.destroyKey();
      set({
        activeProvider: null,
        accessToken: null,
        expiresIn: null,
        isTokenValid: false,
        vault: null,
        summaryVault: null,
      });
    },
  }),
);
