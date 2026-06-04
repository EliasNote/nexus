import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type GoogleDriveState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;
  isTokenValid: boolean;
  setIsTokenValid: (isValid: boolean) => void;
};

export const useGoogleDriveStore = create<GoogleDriveState>()(
  persist(
    (set, get) => ({
      accessToken: null,

      setAccessToken: (token) => set({ accessToken: token }),

      clearSession: () => set({ accessToken: null }),

      expiresIn: null,

      setExpiresIn: (expiresIn) => set({ expiresIn }),

      isTokenValid: false,

      setIsTokenValid: (isValid) => set({ isTokenValid: isValid }),
    }),
    {
      name: "google-drive-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresIn: state.expiresIn,
      }),
    },
  ),
);
