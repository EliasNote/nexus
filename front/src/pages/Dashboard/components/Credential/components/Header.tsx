import type { Credential, CredentialType } from "@/types/vault";
import { Trash2, Pencil, X, Save, RefreshCcw } from "lucide-react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export const Header = ({
  tempVault,
  setTempVault,
  iconsSize,
  handleSaveAndDelete,
  isLoading,
  isEdit,
  isCreate,
  handleEditClick,
  handleCancel,
}: {
  tempVault: Credential;
  setTempVault: React.Dispatch<React.SetStateAction<Credential | null>>;
  iconsSize: number;
  handleSaveAndDelete: () => void;
  isLoading: boolean;
  isEdit: boolean;
  isCreate: CredentialType | null;
  handleEditClick: () => void;
  handleCancel: () => void;
}) => {
  const isWriting = isEdit || isCreate;

  return (
    <div className="flex flex-row w-full justify-between px-10 py-7.5 border-b border-zinc-800">
      <div className="flex gap-2.5">
        <div className="w-15 h-15 flex items-center justify-center text-[32px] bg-zinc-900 border border-zinc-800 text-zinc-300">
          {(tempVault?.title?.[0] || "?").toUpperCase()}
        </div>

        <div className="flex flex-col items-start">
          {isWriting ? (
            <div className="group flex items-center focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 h-[35px] w-full min-w-[300px]">
              <input
                type="text"
                className="flex-1 bg-transparent px-3 text-[16px] text-white font-bold outline-none placeholder:text-zinc-500"
                value={tempVault?.title || ""}
                onChange={(e) =>
                  setTempVault((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
                autoFocus
                placeholder="Título da credencial"
              />
            </div>
          ) : (
            <h2 className="text-[18px] text-zinc-300 font-bold max-w-100 truncate">
              {tempVault?.title}
            </h2>
          )}

          <div className="flex">
            <span className="flex items-center justify-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[14px] font-bold uppercase">
              {tempVault?.type}
            </span>

            <button
              className={`flex items-center justify-center px-3 py-1 ${isWriting ? "cursor-pointer" : "cursor-default"}`}
              disabled={!isWriting}
              onClick={() =>
                setTempVault({
                  ...tempVault!,
                  isFavorite: !tempVault?.isFavorite,
                })
              }
            >
              {tempVault?.isFavorite ? (
                <StarSolid className="text-amber-400 size-[25px]" />
              ) : (
                <StarOutline className="text-zinc-600 size-[25px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 items-center justify-center text-[14px]">
        {isWriting ? (
          <>
            <button
              disabled={isLoading}
              onClick={handleSaveAndDelete}
              className="flex gap-1.25 items-center px-3.5 py-2 border-2 font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RefreshCcw size={iconsSize} />
                </motion.div>
              ) : (
                <>
                  <Save size={iconsSize} />
                  <span>SALVAR</span>
                </>
              )}
            </button>

            {!isLoading && (
              <button
                onClick={handleCancel}
                className="flex gap-1.25 items-center px-3.5 py-2 border-2 font-bold border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
              >
                <X size={iconsSize} />
                <span>CANCELAR</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleEditClick}
              className="flex gap-1.25 items-center px-3.5 py-2 border-2 font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer"
            >
              <Pencil size={iconsSize} />
              <span>EDITAR</span>
            </button>

            <button
              onClick={() =>
                confirm("Mover para a lixeira?") && handleSaveAndDelete()
              }
              className="flex gap-1.25 items-center px-3.5 py-2 border-2 font-bold border-red-alert text-red-alert hover:bg-red-alert hover:text-white cursor-pointer"
            >
              <Trash2 size={iconsSize} />
              <span>APAGAR</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
