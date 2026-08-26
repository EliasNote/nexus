import {
  useGoogleLogin,
  hasGrantedAllScopesGoogle,
  type TokenResponse,
  type NonOAuthError,
} from "@react-oauth/google";
import { useRef } from "react";
import type { GoogleAuthProvider, GoogleToken } from "@/types/types";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 5 * 60 * 1000;

type GoogleSuccessResponse = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

export const useGoogleWebAuth = (): GoogleAuthProvider => {
  const loginPromiseResolveRef = useRef<
    ((token: GoogleToken | null) => void) | null
  >(null);

  const loginPromiseRejectRef = useRef<
    ((reason?: Error) => void) | null
  >(null);

  const forceConsentRef = useRef<boolean>(false);

  const resolvePromise = (token: GoogleToken | null): void => {
    if (loginPromiseResolveRef.current) {
      loginPromiseResolveRef.current(token);
      loginPromiseResolveRef.current = null;
      loginPromiseRejectRef.current = null;
    }
  };

  const rejectPromise = (error: Error): void => {
    if (loginPromiseRejectRef.current) {
      loginPromiseRejectRef.current(error);
      loginPromiseResolveRef.current = null;
      loginPromiseRejectRef.current = null;
    }
  };

  const handleSuccess = (tokenResponse: GoogleSuccessResponse): void => {
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
        throw new Error("Google não retornou o token de acesso válido.");
      }

      forceConsentRef.current = false;

      resolvePromise({
        accessToken,
        expiresAt:
          Date.now() +
          expiresInSec * 1000 -
          TOKEN_EXPIRY_SAFETY_WINDOW_MS,
      });
    } catch (error: unknown) {
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
    onError: (errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => {
      console.error("Erro no login rápido do Google:", errorResponse);
      rejectPromise(
        new Error(
          errorResponse.error_description || "Falha na autenticação com o Google."
        )
      );
    },
    onNonOAuthError: (nonOAuthError: NonOAuthError) => {
      console.error("Erro não-oauth:", nonOAuthError);
      rejectPromise(new Error("Janela de login fechada ou bloqueada."));
    },
  });

  const loginWithConsent = useGoogleLogin({
    scope: DRIVE_SCOPE,
    prompt: "consent",
    onSuccess: handleSuccess,
    onError: (errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => {
      console.error("Erro no login com consentimento do Google:", errorResponse);
      rejectPromise(
        new Error(
          errorResponse.error_description || "Falha na autenticação com o Google."
        )
      );
    },
    onNonOAuthError: (nonOAuthError: NonOAuthError) => {
      console.error("Erro não-oauth:", nonOAuthError);
      rejectPromise(new Error("Janela de login fechada ou bloqueada."));
    },
  });

  const loginWithPromise = (forceConsent = false): Promise<GoogleToken | null> => {
    return new Promise<GoogleToken | null>((resolve, reject) => {
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
    } catch (error: unknown) {
      console.error("Erro ao renovar a sessão:", error);
      return null;
    }
  };

  const disconnect = (): void => {
    resolvePromise(null);
  };

  return {
    login: loginQuick,
    loginWithPromise,
    refresh,
    disconnect,
  };
};
