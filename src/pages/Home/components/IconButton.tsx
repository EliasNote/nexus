import { useState, type ReactNode } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useStorageSync } from "@/hooks/storage/useStorageSync";
import type { StorageProvider } from "@/hooks/storage/types";
import { useCloudStore } from "@/hooks/useCloudStore";
import { GitSteps } from "./GitSteps";
import { saveSettings } from "@/config/settingsStore";

export const IconButton = ({
  id,
  icon,
  title,
  subtitle,
}: {
  id: StorageProvider;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) => {
  const {
    connect,
    setProvider,
  } = useStorageSync();

  const [openGitSteps, setOpenGitSteps] =
    useState(false);

  const handleClick = async () => {
    try {
      setProvider(id);

      switch (id) {
        case "git":
          setOpenGitSteps(true);
          return;
        case "local": {
          const selected = await open({
            directory: true,
            multiple: false,
          });

          if (!selected || Array.isArray(selected)) return;

          useCloudStore.getState().setVaultPath(selected);
          useCloudStore.getState().setIsTokenValid(true);

          saveSettings(selected)

          return;
        }
        default:
          break;
      }

      const token = await connect(id);

      if (token) {
        console.log(`Conectado ao ${id} com sucesso!`);
      }
    } catch (error) {
      console.error(
        `Erro ao conectar ao ${id}:`,
        error,
      );
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex h-[63px] w-full cursor-pointer items-center justify-start border border-zinc-800 bg-zinc-900 p-[14px] transition-colors hover:border-zinc-700 disabled:opacity-50"
      >
        <div className="flex flex-row items-center justify-center gap-[14px]">
          <div className="flex h-[35px] w-[35px] flex-row items-center justify-center border border-zinc-700 bg-zinc-950">
            {icon}
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[14px] font-bold text-white">
              {title}
            </span>

            <span className="text-[12px] text-zinc-600">
              {subtitle}
            </span>
          </div>
        </div>
      </button>

      {openGitSteps && (
        <GitSteps
          onClose={() => setOpenGitSteps(false)}
        />
      )}
    </>
  );
};
