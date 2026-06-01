import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GoogleDriveState {
  accessToken: string | null;
  isSyncing: boolean;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
  refresh: (refreshToken: string) => Promise<string | null>;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const useGoogleDriveStore = create<GoogleDriveState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isSyncing: false,

      setAccessToken: (token) => set({ accessToken: token }),

      clearSession: () => set({ accessToken: null }),

      refresh: async (refreshToken: string) => {
        set({ isSyncing: true });
        try {
          const params = new URLSearchParams();
          params.append("client_id", CLIENT_ID);
          params.append("refresh_token", refreshToken);
          params.append("grant_type", "refresh_token");

          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          });

          if (!response.ok) {
            throw new Error("Falha ao renovar token de acesso");
          }

          const data = await response.json();
          const novoAccessToken = data.access_token;

          set({ accessToken: novoAccessToken });
          return novoAccessToken;
        } catch (error) {
          console.error("Erro na renovação silenciosa:", error);
          set({ accessToken: null });
          return null;
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "google-drive-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    },
  ),
);
