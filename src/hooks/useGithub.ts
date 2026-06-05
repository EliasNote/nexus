import { useState, useRef } from "react";
import { useCloudStore } from "./useCloudStore";

export const useGitHub = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const REPO_NAME = "nexus-vault";

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

  const exchangeGitHubCode = async (code: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error("Erro na troca de tokens");
      const data = await response.json();

      if (data.expires_in) {
        setExpiresIn(Date.now() + data.expires_in * 1000 - 300000);
      } else {
        setExpiresIn(Date.now() + 31536000000);
      }

      setIsTokenValid(true);
      setToken(data.access_token);

      if (data.refresh_token) setRefreshToken(data.refresh_token);

      resolvePromise(data.access_token);
    } catch (error) {
      console.error("Erro na autenticação do GitHub:", error);
      resolvePromise(null);
    }
  };

  const login = () => {
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

    const GITHUB_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;

    const popup = window.open(
      GITHUB_URL,
      "github-oauth",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          resolvePromise(null);
          return;
        }

        if (popup.location.origin === window.location.origin) {
          const urlParams = new URLSearchParams(popup.location.search);
          const code = urlParams.get("code");
          popup.close();
          clearInterval(interval);

          if (code) {
            exchangeGitHubCode(code);
          } else {
            resolvePromise(null);
          }
        }
      } catch (e) {
        console.error("Erro ao renovar a sessão:", e);
      }
    }, 500);
  };

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
      const response = await fetch(`${API_URL}/api/auth/github/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      setExpiresIn(Date.now() + data.expires_in * 1000 - 300000);

      setIsTokenValid(true);
      setToken(data.access_token);

      if (data.refresh_token) setRefreshToken(data.refresh_token);

      return data.access_token;
    } catch (error) {
      clearSession();
      console.error("Erro ao renovar a sessão:", error);
      return null;
    }
  };

  const getUsername = async (accessToken: string): Promise<string> => {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Nexus-Password-Manager",
      },
    });
    if (!res.ok) throw new Error("Erro ao obter perfil do GitHub");
    const data = (await res.json()) as { login: string };
    return data.login;
  };

  const find = async () => {
    if (!token) throw new Error("Não autenticado");
    try {
      const username = await getUsername(token);
      const response = await fetch(
        `https://api.github.com/repos/${username}/${REPO_NAME}/contents/vault.json`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Nexus-Password-Manager",
          },
        },
      );

      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Erro ao buscar no GitHub");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const download = async () => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const username = await getUsername(token);

      const response = await fetch(
        `https://api.github.com/repos/${username}/${REPO_NAME}/contents/vault.json`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Nexus-Password-Manager",
          },
        },
      );

      if (response.status === 404)
        throw new Error("Arquivo não encontrado na nuvem");
      if (!response.ok) throw new Error("Falha no download");
      const data = (await response.json()) as { content: string };

      const decodedContent = decodeURIComponent(
        escape(atob(data.content.replace(/\s/g, ""))),
      );
      return JSON.parse(decodedContent);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVault = async (vaultContentString: string) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const username = await getUsername(token);
      const fileData = await find();
      const sha = fileData?.sha;

      const base64Content = btoa(
        unescape(encodeURIComponent(vaultContentString)),
      );

      const response = await fetch(
        `https://api.github.com/repos/${username}/${REPO_NAME}/contents/vault.json`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "Nexus-Password-Manager",
          },
          body: JSON.stringify({
            message: "Update vault.json",
            content: base64Content,
            sha: sha || undefined,
          }),
        },
      );

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
    find,
    refresh,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
  };
};
