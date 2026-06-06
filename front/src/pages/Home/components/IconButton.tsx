// IconButton.tsx
import type { ReactNode } from "react";
import { useCloudSync } from "@/hooks/useCloudSync";
import { type StorageProvider } from "@/hooks/useCloudStore";
import { getGithubUserData, getGithubUserRepo } from "@/utils/utils";

export const IconButton = ({
  id,
  icon,
  title,
  subtitle,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) => {
  const {
    loginWithPromise,
    isLoading,
    needsRepoFix,
    setNeedsRepoFix,
    loginRepoNotFound,
    setProvider,
  } = useCloudSync();

  const isGithub = id === "github";

  const handleClick = async () => {
    if (needsRepoFix) {
      loginRepoNotFound?.();
    }

    try {
      setProvider(id as StorageProvider);
      const token = await loginWithPromise();

      if (token && isGithub) {
        const userData = await getGithubUserData(token);

        const repoRes = await getGithubUserRepo(token, userData.login);

        if (repoRes.status === 404) {
          setNeedsRepoFix!(true);
          return;
        }
      }

      if (token) console.log(`Conectado ao ${id} com sucesso!`);
    } catch (err) {
      console.error(`Erro ao conectar ao ${id}:`, err);
    }
  };

  return (
    <button
      onClick={() => handleClick()}
      disabled={isLoading && !needsRepoFix}
      className={`flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border transition-colors cursor-pointer disabled:opacity-50 ${
        needsRepoFix && isGithub
          ? "border-red-500 hover:border-red-400"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex flex-row gap-[14px] justify-center items-center">
        <div
          className={`flex flex-row justify-center items-center border w-[35px] h-[35px] bg-zinc-950 ${
            needsRepoFix && isGithub
              ? "border-red-500 text-red-500"
              : "border-zinc-700"
          }`}
        >
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span
            className={`text-[14px] font-bold ${needsRepoFix && isGithub ? "text-red-500" : "text-white"}`}
          >
            {needsRepoFix && isGithub ? "CONCEDER PERMISSÃO" : title}
          </span>
          <span
            className={`text-[12px] ${needsRepoFix && isGithub ? "text-red-400" : "text-zinc-600"}`}
          >
            {needsRepoFix && isGithub
              ? "Clique para reconfigurar no GitHub"
              : subtitle}
          </span>
        </div>
      </div>
    </button>
  );
};
