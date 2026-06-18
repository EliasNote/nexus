import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wrap } from "comlink";
import type { CryptoService } from "../utils/worker";
import type { VaultSummarizedData } from "@/types/vault";

export type StorageProvider = "google" | "github" | null;

const worker = new Worker(new URL("../utils/worker.ts", import.meta.url), {
  type: "module",
});

const cryptoService = wrap<CryptoService>(worker);

type CloudState = {
  vault: null | VaultSummarizedData;
  setVault: (vault: null | VaultSummarizedData) => void;
  encryptedVault: null | any;
  setEncryptedVault: (vault: null) => void;
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
  cryptoService: typeof cryptoService;
};

export const useCloudStore = create<CloudState>()(
  persist(
    (set) => ({
      vault: null,
      setVault: (vault) => set({ vault: vault }),

      encryptedVault: null,
      setEncryptedVault: (vault) => set({ encryptedVault: vault }),

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

      cryptoService,

      clearSession: () => {
        cryptoService.destroyKey();
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          isTokenValid: false,
          vault: null,
          encryptedVault: null,
          activeProvider: null,
        });
      },

      expiresIn: null,
      setExpiresIn: (expiresIn) => set({ expiresIn }),

      isTokenValid: false,
      setIsTokenValid: (isValid) => set({ isTokenValid: isValid }),
    }),
    {
      name: "cloud-sync-store",
      partialize: (state) => ({
        activeProvider: state.activeProvider,
      }),
    },
  ),
);
