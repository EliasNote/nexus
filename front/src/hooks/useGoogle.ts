import { useGoogleLogin } from "@react-oauth/google";
import { useState, useRef } from "react";
import { useCloudStore } from "./useCloudStore";
import type { StorageProviderInterface } from "./interface";
import type { DecryptedVault } from "@/types/vault";

export const useGoogle = (): StorageProviderInterface => {
  const API_URL = import.meta.env.VITE_API_URL;

  const token = useCloudStore((state) => state.accessToken);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const refreshToken = useCloudStore((state) => state.refreshToken);
  const setRefreshToken = useCloudStore((state) => state.setRefreshToken);
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
    flow: "auth-code",
    onSuccess: async (res) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: res.code }),
        });

        if (!response.ok) throw new Error("Erro na troca de tokens");
        const data = await response.json();

        setExpiresIn(Date.now() + data.expires_in * 1000 - 300000);
        setIsTokenValid(true);
        setToken(data.access_token);

        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }

        resolvePromise(data.access_token);
      } catch (error) {
        console.error(error);
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
    if (!refreshToken) {
      clearSession();
      return null;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/google/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      setExpiresIn(Date.now() + data.expires_in * 1000 - 300000);
      setIsTokenValid(true);
      setToken(data.access_token);
      return data.access_token;
    } catch (error) {
      clearSession();
      console.error("Erro ao renovar a sessão:", error);
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

  const uploadVault = async (vault: DecryptedVault, idParam?: string) => {
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
      const file = await find(); // Isso busca o arquivo na appDataFolder
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
