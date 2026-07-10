import { useState } from "react";
import { useCloudStore } from "@/hooks/useCloudStore";
import type { GoogleToken } from "@/types/types";
import type { EncryptedVault } from "@/types/vault";
import { useGoogleWebAuth } from "./webAuth";
import type {
  CloudFileMetadata,
  CloudUploadResult,
  StorageProviderInterface,
} from "../../types";

const VAULT_FILE_NAME = "vault.json";
const APP_DATA_SPACE = "appDataFolder";

function assertAccessToken(token: string | null): string {
  if (!token) {
    throw new Error("Não autenticado no Google.");
  }

  return token;
}

async function parseGoogleError(response: Response): Promise<Error> {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as {
      error?: {
        message?: string;
      };
    };

    return new Error(data.error?.message || text || "Erro na API do Google.");
  } catch {
    return new Error(text || "Erro na API do Google.");
  }
}

export function useGoogleStorage(): StorageProviderInterface {
  const auth = useGoogleWebAuth();
  const token = useCloudStore((state) => state.accessToken);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const clearSession = useCloudStore((state) => state.clearSession);

  const [isLoading, setIsLoading] = useState(false);

  const applyToken = (response: GoogleToken): string => {
    setToken(response.accessToken);
    setExpiresIn(response.expiresAt);
    setIsTokenValid(response.expiresAt > Date.now());

    return response.accessToken;
  };

  const loginWithPromise = async (): Promise<string | null> => {
    try {
      const response = await auth.loginWithPromise();

      return response ? applyToken(response) : null;
    } catch (error) {
      console.error("Erro no login Google:", error);
      clearSession();
      return null;
    }
  };

  const login = (): void => {
    void loginWithPromise();
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

  const find = async (): Promise<CloudFileMetadata | null> => {
    const accessToken = assertAccessToken(token);
    const query = encodeURIComponent(`name = '${VAULT_FILE_NAME}'`);
    const url = `https://www.googleapis.com/drive/v3/files?spaces=${APP_DATA_SPACE}&q=${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw await parseGoogleError(response);
    }

    const data = (await response.json()) as {
      files?: CloudFileMetadata[];
    };

    return data.files?.[0] ?? null;
  };

  const download = async (): Promise<EncryptedVault> => {
    setIsLoading(true);

    const accessToken = assertAccessToken(token);
    const file = await find();

    if (!file?.id) {
      throw new Error("Arquivo não encontrado na nuvem.");
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw await parseGoogleError(response);
      }

      return (await response.json()) as EncryptedVault;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVault = async (
    vault: EncryptedVault,
  ): Promise<CloudUploadResult> => {
    setIsLoading(true);
    const accessToken = assertAccessToken(token);
    const existingFile = await find();
    const fileId = existingFile?.id;

    try {
      const metadata = {
        name: VAULT_FILE_NAME,
        parents: fileId ? undefined : [APP_DATA_SPACE],
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

      return (await response.json()) as CloudUploadResult;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVault = async (): Promise<void> => {
    const accessToken = assertAccessToken(token);
    const file = await find();

    if (!file?.id) {
      throw new Error("Arquivo não encontrado no Google Drive.");
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}`,
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
    void Promise.resolve(auth.disconnect()).catch((error) => {
      console.error("Erro ao desconectar Google:", error);
    });

    clearSession();
  };

  return {
    token,
    isLoading,
    login,
    loginWithPromise,
    refresh,
    find,
    download,
    uploadVault,
    deleteVault,
    disconnect,
  };
}
