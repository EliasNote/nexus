// nexus-main/front/src/hooks/useGithub.ts (Versão PAT para Web sem Servidor)
import { useState, useRef } from "react";
import { useCloudStore } from "./useCloudStore";
import type { StorageProviderInterface } from "./interface";
import type { EncryptedVault } from "@/types/vault";

export const useGitHub = (): StorageProviderInterface => {
  const REPO_NAME = "nexus-vault";

  const token = useCloudStore((state) => state.accessToken);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const clearSession = useCloudStore((state) => state.clearSession);
  const needsRepoFix = useCloudStore((state) => state.needsRepoFix);
  const setNeedsRepoFix = useCloudStore((state) => state.setNeedsRepoFix);

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

  // Solicita o token de acesso pessoal diretamente ao usuário
  const login = async () => {
    setIsLoading(true);
    try {
      const pat = window.prompt(
        "Por favor, insira o seu Personal Access Token (PAT) do GitHub.\n\nEle deve ter a permissão de escopo 'repo' para que o cofre possa ser lido e salvo.",
      );

      if (!pat) {
        resolvePromise(null);
        return;
      }

      // Valida o Token buscando o perfil do usuário
      const username = await getUsername(pat);
      if (username) {
        setToken(pat);
        setExpiresIn(null); // Tokens PAT não expiram sozinhos em 1 hora
        setIsTokenValid(true);
        resolvePromise(pat);
      } else {
        resolvePromise(null);
      }
    } catch (error) {
      console.error("Erro ao validar token do GitHub:", error);
      alert("Token inválido ou sem permissões necessárias.");
      resolvePromise(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPromise = (): Promise<string | null> => {
    return new Promise((resolve) => {
      loginPromiseResolveRef.current = resolve;
      login();
    });
  };

  const loginRepoNotFound = () => {
    const GITHUB_PUBLIC_URL = import.meta.env.VITE_GITHUB_PUBLIC_URL;
    window.open(GITHUB_PUBLIC_URL, "_blank");
    setNeedsRepoFix(false);
  };

  const refresh = async (): Promise<string | null> => {
    clearSession();
    return null;
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
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://api.github.com/repos/${username}/${REPO_NAME}/contents/vault.json?t=${timestamp}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Nexus-Password-Manager",
          },
        },
      );

      if (response.status === 404) throw new Error("GITHUB_404");
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

  const uploadVault = async (vault: EncryptedVault) => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);

    try {
      const username = await getUsername(token);
      const fileData = await find();
      const sha = fileData?.sha;

      const base64Content = btoa(
        unescape(encodeURIComponent(JSON.stringify(vault))),
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

      if (!response.ok) {
        if (response.status === 404) throw new Error("GITHUB_404");
        throw new Error("Falha no upload");
      }
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

  const deleteVault = async () => {
    if (!token) throw new Error("Não autenticado");
    setIsLoading(true);
  };

  return {
    token,
    isLoading,
    login,
    find,
    loginRepoNotFound,
    needsRepoFix,
    setNeedsRepoFix,
    refresh,
    loginWithPromise,
    download,
    uploadVault,
    disconnect,
    deleteVault,
  };
};
