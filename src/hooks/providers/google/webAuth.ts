import { useGoogleLogin, hasGrantedAllScopesGoogle } from "@react-oauth/google";
import { useRef } from "react";
import type { GoogleAuthProvider, GoogleToken } from "@/types/types";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 5 * 60 * 1000;

export const useGoogleWebAuth = (): GoogleAuthProvider => {
  const loginPromiseResolveRef = useRef<((token: GoogleToken | null) => void) | null>(null);
  const loginPromiseRejectRef = useRef<((reason?: any) => void) | null>(null);

  const forceConsentRef = useRef(false);

  const resolvePromise = (token: GoogleToken | null) => {
    if (loginPromiseResolveRef.current) {
      loginPromiseResolveRef.current(token);
      loginPromiseResolveRef.current = null;
      loginPromiseRejectRef.current = null;
    }
  };

  const rejectPromise = (error: Error) => {
    if (loginPromiseRejectRef.current) {
      loginPromiseRejectRef.current(error);
      loginPromiseResolveRef.current = null;
      loginPromiseRejectRef.current = null;
    }
  };

  const handleSuccess = (tokenResponse: any) => {
    try {
      const hasScope = hasGrantedAllScopesGoogle(tokenResponse, DRIVE_SCOPE);

      if (!hasScope) {
        forceConsentRef.current = true;
        throw new Error(
          "Você precisa conceder a permissão de acesso ao Google Drive. Tente conectar novamente para autorizar."
        );
      }

      const accessToken = tokenResponse.access_token;
      const expiresInSec = tokenResponse.expires_in;

      if (!accessToken || !expiresInSec) {
        throw new Error("Google não retornou o token de acesso.");
      }

      forceConsentRef.current = false;

      resolvePromise({
        accessToken,
        expiresAt: Date.now() + expiresInSec * 1000 - TOKEN_EXPIRY_SAFETY_WINDOW_MS,
      });
    } catch (error) {
      console.error("Erro ao validar permissões:", error);
      rejectPromise(
        error instanceof Error
          ? error
          : new Error("Permissões necessárias não foram concedidas.")
      );
    }
  };

  const loginQuick = useGoogleLogin({
    scope: DRIVE_SCOPE,
    prompt: "select_account",
    onSuccess: handleSuccess,
    onError: (error) => {
      console.error(error);
      rejectPromise(new Error("Falha no login com Google."));
    },
    onNonOAuthError: (error) => {
      console.error(error);
      rejectPromise(new Error("Janela de login fechada."));
    },
  });

  const loginWithConsent = useGoogleLogin({
    scope: DRIVE_SCOPE,
    prompt: "consent",
    onSuccess: handleSuccess,
    onError: (error) => {
      console.error(error);
      rejectPromise(new Error("Falha no login com Google."));
    },
    onNonOAuthError: (error) => {
      console.error(error);
      rejectPromise(new Error("Janela de login fechada."));
    },
  });

  const loginWithPromise = (forceConsent = false): Promise<GoogleToken | null> => {
    return new Promise((resolve, reject) => {
      loginPromiseResolveRef.current = resolve;
      loginPromiseRejectRef.current = reject;

      if (forceConsent || forceConsentRef.current) {
        loginWithConsent();
      } else {
        loginQuick();
      }
    });
  };

  const refresh = async (): Promise<GoogleToken | null> => {
    try {
      return await loginWithPromise();
    } catch (error) {
      console.error("Erro ao renovar a sessão:", error);
      return null;
    }
  };

  const disconnect = () => {
    resolvePromise(null);
  };

  return {
    login: loginQuick,
    loginWithPromise,
    refresh,
    disconnect,
  };
};
