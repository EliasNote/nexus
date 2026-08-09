import { useCloudStore } from "@/hooks/useCloudStore";
import type { GoogleToken } from "@/types/types";
import type { EncryptedVault } from "@/types/vault";
import { useGoogleWebAuth } from "./webAuth";
import type {
  AuthSession,
  VaultMetadata,
  VaultStorage,
} from "../../types";

const VAULT_FILE_NAME = "vault.json";
const APP_DATA_SPACE = "appDataFolder";

function requireToken(token: string | null): string {
  if (!token) {
    throw new Error("Não autenticado no Google.");
  }

  return token;
}

async function parseGoogleError(
  response: Response,
): Promise<Error> {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as {
      error?: {
        message?: string;
      };
    };

    return new Error(
      data.error?.message ||
        text ||
        "Erro na API do Google.",
    );
  } catch {
    return new Error(text || "Erro na API do Google.");
  }
}

export function useGoogleDrive(): VaultStorage & {
  session: AuthSession;
} {
  const auth = useGoogleWebAuth();

  const token = useCloudStore((state) => state.accessToken);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const clearSession = useCloudStore((state) => state.clearSession);

  const applyToken = (response: GoogleToken): string => {
    setToken(response.accessToken);
    setExpiresIn(response.expiresAt);
    setIsTokenValid(response.expiresAt > Date.now());

    return "google";
  };

  const connect = async (): Promise<string | null> => {
    try {
      const response = await auth.loginWithPromise();

      return response ? applyToken(response) : null;
    } catch (error) {
      console.error("Erro no login Google:", error);
      clearSession();
      return null;
    }
  };

  const refresh = async (): Promise<string | null> => {
    try {
      const response = await auth.refresh();

      return response ? applyToken(response) : null;
    } catch (error) {
      console.error(
        "Erro ao renovar o token Google:",
        error,
      );

      clearSession();
      return null;
    }
  };

  const exists = async (): Promise<string | null> => {
    const accessToken = requireToken(token);

    const query = encodeURIComponent(
      `name = '${VAULT_FILE_NAME}'`,
    );

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files` +
        `?spaces=${APP_DATA_SPACE}&q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw await parseGoogleError(response);
    }

    const data = (await response.json()) as {
      files?: VaultMetadata[];
    };

    return data.files?.[0]?.id ?? null;
  };

  const download = async (): Promise<EncryptedVault> => {
    try {
      const accessToken = requireToken(token);
      const fileId = await exists();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw await parseGoogleError(response);
      }

      return (await response.json()) as EncryptedVault;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const upload = async (
    vault: EncryptedVault,
  ): Promise<void> => {
    try {
      const accessToken = requireToken(token);
      const fileId = await exists();

      const metadata = {
        name: VAULT_FILE_NAME,
        parents: fileId
          ? undefined
          : [APP_DATA_SPACE],
      };

      const form = new FormData();

      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], {
          type: "application/json",
        }),
      );

      form.append(
        "file",
        new Blob([JSON.stringify(vault)], {
          type: "application/json",
        }),
      );

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

      const response = await fetch(url, {
        method: fileId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw await parseGoogleError(response);
      }
    } catch(error) {
      console.log(error);
      throw error;
    }
  };

  const deleteVault = async (): Promise<void> => {
    const accessToken = requireToken(token);
    const fileId = await exists();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok && response.status !== 204) {
      throw await parseGoogleError(response);
    }
  };

  const disconnect = (): void => {
    auth.disconnect();
  };

  return {
    exists,
    download,
    upload,
    delete: deleteVault,
    session: {
      isAuthenticated: Boolean(token),
      connect,
      refresh,
      disconnect,
    },
  };
}
