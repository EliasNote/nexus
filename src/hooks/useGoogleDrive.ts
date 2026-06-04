import { useGoogleLogin } from "@react-oauth/google";
import { useState, useRef } from "react";
import { useGoogleDriveStore } from "./useGoogleDriveStore";

export const useGoogleDrive = () => {
  const token = useGoogleDriveStore((state) => state.accessToken);
  const setToken = useGoogleDriveStore((state) => state.setAccessToken);
  const clearSession = useGoogleDriveStore((state) => state.clearSession);
  const setExpiresIn = useGoogleDriveStore((state) => state.setExpiresIn);
  const setIsTokenValid = useGoogleDriveStore((state) => state.setIsTokenValid);

  const [isLoading, setIsLoading] = useState(false);
  const loginPromiseResolveRef = useRef<
    ((token: string | null) => void) | null
  >(null);

  const resolvePromise = (token: string | null) => {
    if (loginPromiseResolveRef.current) {
      loginPromiseResolveRef.current(token);
      loginPromiseResolveRef.current = null;
    }
  };

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.appdata",
    onSuccess: (res) => {
      setExpiresIn(Date.now() + res.expires_in * 1000 - 300000);
      setIsTokenValid(true);
      setToken(res.access_token);
      resolvePromise(res.access_token);
    },
    onError: (error) => {
      console.error("Erro ao conectar ao Google Drive:", error);
      resolvePromise(null);
    },
    onNonOAuthError: (error) => {
      console.error("Ação cancelada ou popup fechado:", error);
      resolvePromise(null);
    },
  });

  const loginRefresh = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.appdata",
    prompt: "none",
    onSuccess: (res) => {
      setExpiresIn(Date.now() + res.expires_in * 1000 - 300000);
      setIsTokenValid(true);
      setToken(res.access_token);
      resolvePromise(res.access_token);
    },
    onError: (error) => {
      console.error("Erro ao renovar o token:", error);
      resolvePromise(null);
      clearSession();
    },
    onNonOAuthError: (error) => {
      console.error("Erro ao renovar token:", error);
      resolvePromise(null);
      clearSession();
    },
  });

  const loginWithPromise = (): Promise<string | null> => {
    return new Promise((resolve) => {
      loginPromiseResolveRef.current = resolve;
      login();
    });
  };

  const find = async () => {
    const query = encodeURIComponent("name = 'vault.json'");
    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Erro ao buscar no Drive");
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  };

  const download = async (idParam?: string) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const id = idParam ?? (await find())?.id;
      if (!id) throw new Error("Arquivo não encontrado na nuvem");

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
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

  const uploadVault = async (vaultContentString: string, idParam?: string) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const id = idParam ?? (await find())?.id;
      if (!id) throw new Error("Arquivo não encontrado na nuvem");

      const metadata = {
        name: "vault.json",
        parents: id ? undefined : ["appDataFolder"],
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

      const url = id
        ? `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart`
        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

      const response = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) throw new Error("Falha no upload");
      return response.json();
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
    find,
    loginRefresh,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
  };
};
