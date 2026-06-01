import { create } from "zustand";
import { persist } from "zustand/middleware";

type GoogleDriveState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;
};

export const useGoogleDriveStore = create<GoogleDriveState>()(
  persist(
    (set, get) => ({
      accessToken: null,

      setAccessToken: (token) => set({ accessToken: token }),

      clearSession: () => set({ accessToken: null }),

      expiresIn: null,

      setExpiresIn: (expiresIn) => set({ expiresIn }),
    }),
    {
      name: "google-drive-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    },
  ),
);
