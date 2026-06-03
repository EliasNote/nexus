import { useGoogleLogin } from "@react-oauth/google";
import { useState, useRef } from "react";
import { useGoogleDriveStore } from "./useGoogleDriveStore";

export const useGoogleDrive = () => {
  const token = useGoogleDriveStore((state) => state.accessToken);
  const setToken = useGoogleDriveStore((state) => state.setAccessToken);
  const clearSession = useGoogleDriveStore((state) => state.clearSession);
  const setExpiresIn = useGoogleDriveStore((state) => state.setExpiresIn);

  const [isLoading, setIsLoading] = useState(false);
  const loginPromiseResolveRef = useRef<((token: string) => void) | null>(null);

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.appdata",
    onSuccess: (res) => {
      setExpiresIn(Date.now() + res.expires_in * 1000 - 300000);
      setToken(res.access_token);
      if (loginPromiseResolveRef.current) {
        loginPromiseResolveRef.current(res.access_token);
        loginPromiseResolveRef.current = null;
      }
    },
    onError: (error) => {
      console.error("Erro ao conectar ao Google Drive:", error);
      alert("Erro ao conectar ao Google Drive.");
    },
  });

  const loginRefresh = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.appdata",
    prompt: "none",
    onSuccess: (res) => {
      setExpiresIn(Date.now() + res.expires_in * 1000 - 300000);
      setToken(res.access_token);
      if (loginPromiseResolveRef.current) {
        loginPromiseResolveRef.current(res.access_token);
        loginPromiseResolveRef.current = null;
      }
    },
    onError: (error) => {
      console.error("Erro ao renovar o token:", error);
      if (loginPromiseResolveRef.current)
        loginPromiseResolveRef.current(null as any);
      clearSession();
    },
  });

  const loginWithPromise = (): Promise<string> => {
    return new Promise((resolve) => {
      loginPromiseResolveRef.current = resolve;
      login();
    });
  };

  const refresh = async () => {
    try {
      const newToken = await loginWithPromise();

      setToken(newToken);
      return;
    } catch (error) {
      console.error("Erro na renovação do token:", error);
      clearSession();
      return null;
    }
  };

  const find = async (accessToken: string) => {
    const query = encodeURIComponent("name = 'vault.json'");
    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Erro ao buscar no Drive");
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  };

  const download = async (accessToken?: string) => {
    const tokenToUse = accessToken || token;
    if (!tokenToUse) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const file = await find(tokenToUse);
      if (!file) throw new Error("Arquivo não encontrado na nuvem");

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${tokenToUse}` },
        },
      );

      if (!response.ok) throw new Error("Falha no download");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVault = async (
    vaultContentString: string,
    firstUpload: boolean,
  ) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    if (!firstUpload) return;

    try {
      const existingFile = await find(token);
      const fileId = existingFile ? existingFile.id : undefined;

      const metadata = {
        name: "vault.json",
        parents: fileId ? undefined : ["appDataFolder"],
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" }),
      );
      form.append(
        "file",
        new Blob([vaultContentString], { type: "application/json" }),
      );

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

      const response = await fetch(url, {
        method: fileId ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) throw new Error("Falha no upload");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    clearSession();
  };

  return {
    token,
    isLoading,
    login,
    loginWithPromise,
    refresh,
    download,
    uploadVault,
    disconnect,
  };
};
