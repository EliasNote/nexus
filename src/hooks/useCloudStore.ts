import { create } from "zustand";
import { wrap } from "comlink";
import type { CryptoService } from "../utils/worker";
import type {
  StorageProvider,
} from "./storage/types";
import type {
  EncryptedVault,
  VaultSummarizedData,
} from "@/types/vault";

const worker = new Worker(new URL("../utils/worker.ts", import.meta.url), {
  type: "module",
});

export const cryptoService = wrap<CryptoService>(worker);

type CloudState = {
  activeProvider: StorageProvider;
  setActiveProvider: (
    provider: StorageProvider,
  ) => void;

  vault: EncryptedVault | null;
  setVault: (vault: EncryptedVault | null) => void;

  summaryVault: VaultSummarizedData | null;
  setSummaryVault: (
    vault: VaultSummarizedData | null,
  ) => void;

  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;

  isTokenValid: boolean;
  setIsTokenValid: (value: boolean) => void;

  isPendingSync: boolean;
  setIsPendingSync: (value: boolean) => void;

  isSaving: boolean;
  setIsSaving: (value: boolean) => void;

  autoSaveInterval: number;
  setAutoSaveInterval: (value: number) => void;

  clearSession: () => void;
};

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
