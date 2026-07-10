import { useGoogleLogin } from "@react-oauth/google";
import { useRef } from "react";
import type { GoogleAuthProvider, GoogleToken } from "@/types/types";

const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 5 * 60 * 1000;

export const useGoogleWebAuth = (): GoogleAuthProvider => {
  const loginPromiseResolveRef = useRef<
    ((token: GoogleToken | null) => void) | null
  >(null);

  const resolvePromise = (token: GoogleToken | null) => {
    if (loginPromiseResolveRef.current) {
      loginPromiseResolveRef.current(token);
      loginPromiseResolveRef.current = null;
    }
  };

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.appdata",
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        const expiresInSec = tokenResponse.expires_in;

        if (!accessToken || !expiresInSec) {
          throw new Error("Google não retornou access_token ou expires_in.");
        }

        resolvePromise({
          accessToken,
          expiresAt:
            Date.now() +
            expiresInSec * 1000 -
            TOKEN_EXPIRY_SAFETY_WINDOW_MS,
        });
      } catch (error) {
        console.error("Erro ao definir access token do Google:", error);
        resolvePromise(null);
      }
    },
    onError: (error) => {
      console.error("Erro no login do Google:", error);
      resolvePromise(null);
    },
    onNonOAuthError: (error) => {
      console.error("Popup fechado ou erro não-oauth:", error);
      resolvePromise(null);
    },
  });

  const loginWithPromise = (): Promise<GoogleToken | null> => {
    return new Promise((resolve) => {
      loginPromiseResolveRef.current = resolve;
      login();
    });
  };

  const refresh = async (): Promise<GoogleToken | null> => {
    try {
      return await loginWithPromise();
    } catch (error) {
      console.error("Erro ao renovar a sessão do Google:", error);
      return null;
    }
  };

  const disconnect = () => {
    resolvePromise(null);
  };

  return {
    login,
    loginWithPromise,
    refresh,
    disconnect,
  };
};
