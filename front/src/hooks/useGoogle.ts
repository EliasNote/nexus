import { useGoogleLogin } from "@react-oauth/google";
import { useState, useRef } from "react";
import { useCloudStore } from "./useCloudStore";
import type { EncryptedVault } from "@/types/vault";
import type { StorageProviderInterface } from "./interface";

export const useGoogle = (): StorageProviderInterface => {
  const token = useCloudStore((state) => state.accessToken);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const clearSession = useCloudStore((state) => state.clearSession);

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
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        const expiresInSec = tokenResponse.expires_in;

        setToken(accessToken);
        setExpiresIn(Date.now() + expiresInSec * 1000 - 300000);
        setIsTokenValid(true);

        resolvePromise(accessToken);
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

  const loginWithPromise = (): Promise<string | null> => {
    return new Promise((resolve) => {
      loginPromiseResolveRef.current = resolve;
      login();
    });
  };

  const refresh = async (): Promise<string | null> => {
    try {
      console.log("Renovando sessão do Google...");

      const newToken = await loginWithPromise();
      return newToken;
    } catch (error) {
      console.error("Erro ao renovar a sessão do Google:", error);
      clearSession();
      return null;
    }
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

  const uploadVault = async (vault: EncryptedVault, idParam?: string) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const id = idParam ?? (await find())?.id;

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
        new Blob([JSON.stringify(vault)], { type: "application/json" }),
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

  const deleteVault = async () => {
    if (!token) {
      alert("Faça login primeiro!");
      return;
    }

    try {
      const file = await find();
      if (!file || !file.id) {
        alert("Arquivo não encontrado no Google Drive.");
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 204) {
        alert("Arquivo apagado com sucesso!");
      } else {
        const error = await response.json();
        console.error(error);
        alert("Erro ao apagar arquivo.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro na requisição.");
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
    refresh,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
    deleteVault,
  };
};
