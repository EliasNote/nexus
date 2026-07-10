import type { ReactNode } from "react";
import { useStorageSync } from "@/hooks/storage/useStorageSync";
import type { StorageProvider } from "@/hooks/storage/types";

type IconButtonProps = {
  id: Exclude<StorageProvider, null>;
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export const IconButton = ({
  id,
  icon,
  title,
  subtitle,
}: IconButtonProps) => {
  const { loginWithPromise, isLoading, setProvider } = useStorageSync();

  const handleClick = async () => {
    try {
      setProvider(id);
      const token = await loginWithPromise();

      if (token) {
        console.log(`Conectado ao ${id} com sucesso!`);
      }
    } catch (err) {
      console.error(`Erro ao conectar ao ${id}:`, err);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50 hover:border-zinc-700"
    >
      <div className="flex flex-row gap-[14px] justify-center items-center">
        <div className="flex flex-row justify-center items-center border w-[35px] h-[35px] bg-zinc-950 border-zinc-700">
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[14px] font-bold text-white">{title}</span>
          <span className="text-[12px] text-zinc-600">{subtitle}</span>
        </div>
      </div>
    </button>
  );
};
