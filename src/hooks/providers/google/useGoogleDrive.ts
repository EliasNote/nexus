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

async function parseGoogleError(response: Response): Promise<Error> {
  const status = response.status;
  let detailMessage = "";
  let rawText = "";

  try {
    rawText = await response.text();

    if (rawText) {
      const data = JSON.parse(rawText) as {
        error?: {
          message?: string;
          code?: number;
          errors?: Array<{ reason?: string; message?: string }>;
        };
        error_description?: string;
      };

      detailMessage =
        data.error?.message ||
        data.error_description ||
        data.error?.errors?.[0]?.message ||
        rawText;
    }
  } catch {
    detailMessage = rawText;
  }

  if (status === 401) {
    return new Error("Sessão expirada. Por favor, conecte-se ao Google novamente.");
  }

  if (status === 403) {
    const isPermissionError =
      detailMessage.toLowerCase().includes("insufficientpermissions") ||
      detailMessage.toLowerCase().includes("scope") ||
      detailMessage.toLowerCase().includes("permission");

    return new Error(
      isPermissionError
        ? "Permissão insuficiente. Conecte-se novamente ao Google e autorize o acesso ao armazenamento."
        : `Acesso negado pelo Google Drive: ${detailMessage || "Permissão negada."}`
    );
  }

  if (status === 404) {
    return new Error("Arquivo do cofre não encontrado no Google Drive.");
  }

  return new Error(detailMessage || `Erro na comunicação com o Google Drive (Status: ${status}).`);
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
      throw error;
    }
  };

  const refresh = async (): Promise<string | null> => {
    try {
      const response = await auth.refresh();

      return response ? applyToken(response) : null;
    } catch (error) {
      console.error("Erro ao renovar o token Google:", error);
      clearSession();
      return null;
    }
  };

  const handleApiError = async (response: Response): Promise<never> => {
    const error = await parseGoogleError(response);
    if (response.status === 401 || response.status === 403) {
      clearSession();
    }
    throw error;
  };

  const exists = async (): Promise<string | null> => {
    const accessToken = requireToken(token);

    const query = encodeURIComponent(
      `name = '${VAULT_FILE_NAME}' and trashed = false`
    );

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=${APP_DATA_SPACE}&q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = (await response.json()) as {
      files?: VaultMetadata[];
    };

    return data.files?.[0]?.id ?? null;
  };

  const download = async (): Promise<EncryptedVault> => {
    const accessToken = requireToken(token);
    const fileId = await exists();

    if (!fileId) {
      throw new Error("Arquivo do cofre não encontrado no Google Drive.");
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return (await response.json()) as EncryptedVault;
  };

  const upload = async (vault: EncryptedVault): Promise<void> => {
    const accessToken = requireToken(token);
    const fileId = await exists();

    const metadata = {
      name: VAULT_FILE_NAME,
      parents: fileId ? undefined : [APP_DATA_SPACE],
    };

    const form = new FormData();

    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      })
    );

    form.append(
      "file",
      new Blob([JSON.stringify(vault)], {
        type: "application/json",
      })
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
      await handleApiError(response);
    }
  };

  const deleteVault = async (): Promise<void> => {
    const accessToken = requireToken(token);
    const fileId = await exists();

    if (!fileId) return;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      await handleApiError(response);
    }
  };

  const disconnect = (): void => {
    auth.disconnect();
    clearSession();
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
