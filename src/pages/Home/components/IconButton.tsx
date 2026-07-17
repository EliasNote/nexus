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
  const { connect } = useStorageSync();

  const [openGitSteps, setOpenGitSteps] =
    useState(false);
  const activeProvider = useCloudStore(
    (state) => state.activeProvider,
  );
  const vaultPath = useCloudStore((state) => state.vaultPath);
  const isActive = activeProvider === id;

  const handleClick = async () => {
    try {
      switch (id) {
        case "git":
          setOpenGitSteps(true);
          return;

        case "local": {
          const selected = await open({
            directory: true,
            multiple: false,
            recursive: true,
          });

          if (!selected || Array.isArray(selected)) return;

          useCloudStore.getState().setVaultPath(selected);
          await saveSettings(selected, "local");

          const connected = await connect("local");

          if (connected) {
            console.log("Conectado ao local com sucesso!");
          }

          return;
        }

        case "google": {
          const connected = await connect("google");

          if (connected) {
            console.log("Conectado ao Google com sucesso!");
          }

          return;
        }
      }
    } catch (error) {
      console.error(`Erro ao conectar ao ${id}:`, error);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-pressed={isActive}
        className={`relative flex min-h-[63px] w-full cursor-pointer items-center justify-between overflow-hidden border bg-zinc-900 p-[14px] text-left transition-colors ${
          isActive
            ? "border-zinc-600"
            : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        {isActive && (
          <span className="absolute inset-y-0 left-0 w-[2px] bg-brand" />
        )}

        <div className="flex min-w-0 flex-1 flex-row items-center gap-[14px]">
          <div className="flex h-[35px] w-[35px] shrink-0 flex-row items-center justify-center border border-zinc-700 bg-zinc-950">
            {icon}
          </div>

          <div className="min-w-0 gap-1 flex flex-col justify-center items-start leading-tight">
            <span className="text-[14px] font-bold text-white">
              {title}
            </span>

            <div className="flex flex-col items-start">
              <span className="text-[12px] text-zinc-600">
                {subtitle}
              </span>

              {id === "local" && vaultPath && (
                <span
                  className="mt-0.5 max-w-[230px] truncate font-mono text-[12px] text-zinc-600"
                  title={vaultPath}
                >
                  {vaultPath}
                </span>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <span className="ml-3 flex items-center gap-2 text-[12px] font-bold text-zinc-500">
            <span className="h-1.5 w-1.5 bg-green-500" />
            ATIVO
          </span>
        )}
      </button>

      {openGitSteps && (
        <GitSteps
          onClose={() => setOpenGitSteps(false)}
        />
      )}
    </>
  );
};
