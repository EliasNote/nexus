import type { ReactNode } from "react";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useCloudStore, type StorageProvider } from "@/hooks/useCloudStore";

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
  const { loginWithPromise, isLoading } = useCloudSync();
  const setProvider = useCloudStore((state) => state.setActiveProvider);

  const handleClick = async () => {
    try {
      setProvider(id as StorageProvider);
      const token = await loginWithPromise();
      if (token) console.log(`Conectado ao ${id} com sucesso!`);
    } catch (err) {
      console.error(`Erro ao conectar ao ${id}:`, err);
    }
  };

  return (
    <button
      onClick={() => handleClick()}
      disabled={isLoading}
      className="flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
    >
      <div className="flex flex-row gap-[14px] justify-center items-center">
        <div className="flex flex-row justify-center items-center border border-zinc-700 w-[35px] h-[35px] bg-zinc-950">
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-white text-[14px] font-bold">{title}</span>
          <span className="text-zinc-600 text-[12px]">{subtitle}</span>
        </div>
      </div>
    </button>
  );
};
