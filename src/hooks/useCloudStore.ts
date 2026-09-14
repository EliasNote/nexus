import { create } from "zustand";
import { wrap } from "comlink";
import type { CryptoService } from "../utils/worker";
import type { CloudState } from "./types";

import type { Remote } from "comlink";

let rawWorker: Worker | null = null;
let wrappedWorker: Remote<CryptoService> | null = null;

export const initCryptoWorker = (): Remote<CryptoService> => {
  if (rawWorker) {
    rawWorker.terminate();
  }
  rawWorker = new Worker(new URL("../utils/worker.ts", import.meta.url), {
    type: "module",
  });
  wrappedWorker = wrap<CryptoService>(rawWorker);
  return wrappedWorker;
};

export const terminateCryptoWorker = () => {
  if (rawWorker) {
    rawWorker.terminate();
    rawWorker = null;
    wrappedWorker = null;
  }
};

export const getCryptoService = (): Remote<CryptoService> => {
  if (!wrappedWorker) {
    return initCryptoWorker();
  }
  return wrappedWorker;
};

export const useCloudStore = create<CloudState>((set) => ({
  activeProvider: null,

  setActiveProvider: (provider) => {
    set({ activeProvider: provider });
  },

  encryptedVault: null,

  setEncryptedVault: (encryptedVault) => {
    set({ encryptedVault });
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

  clearSession: () => {
    if (wrappedWorker) {
      wrappedWorker.destroyKey();
    }
    terminateCryptoWorker();
    set({
      activeProvider: null,
      accessToken: null,
      expiresIn: null,
      isTokenValid: false,
      vault: null,
      summaryVault: null,
    });
  },
}));
