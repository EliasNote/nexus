import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StorageProvider = "google" | "github" | null;

type CloudState = {
  vault: null;
  setVault: (vault: null) => void;
  activeProvider: StorageProvider;
  setActiveProvider: (provider: StorageProvider) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  clearSession: () => void;
  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;
  isTokenValid: boolean;
  setIsTokenValid: (isValid: boolean) => void;
};

export const useCloudStore = create<CloudState>()(
  persist(
    (set) => ({
      vault: null,
      setVault: (vault) => set({ vault: vault }),

      accessToken: null,
      setAccessToken: (token) => set({ accessToken: token }),

      refreshToken: null,
      setRefreshToken: (token) => set({ refreshToken: token }),

      activeProvider: null,
      setActiveProvider: (provider) => set({ activeProvider: provider }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          isTokenValid: false,
        }),

      expiresIn: null,
      setExpiresIn: (expiresIn) => set({ expiresIn }),

      isTokenValid: false,
      setIsTokenValid: (isValid) => set({ isTokenValid: isValid }),
    }),
    {
      name: "cloud-sync-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
      }),
    },
  ),
);
