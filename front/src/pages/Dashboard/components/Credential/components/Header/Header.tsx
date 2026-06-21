import type {
  Credential,
  CredentialType,
  VaultSummarizedData,
} from "@/types/vault";
import { Trash2, Pencil, X, Save, RefreshCcw, Undo2 } from "lucide-react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Button } from "./components/Button";

export const Header = ({
  tempVault,
  setTempVault,
  iconsSize,
  handleSave,
  isLoadingCredential,
  isEdit,
  isCreate,
  handleEditClick,
  handleCancel,
}: {
  tempVault: Credential;
  setTempVault: React.Dispatch<React.SetStateAction<Credential | null>>;
  iconsSize: number;
  handleSave: (
    newTempVault: Credential,
    newSummaryVault: VaultSummarizedData,
  ) => Promise<void>;
  isLoadingCredential: boolean;
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
            {isLoadingCredential ? (
              <Button color="brand" disabled={isLoadingCredential}>
                <motion.div
                  initial={{ scaleX: -1 }}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RefreshCcw size={22} />
                </motion.div>
              </Button>
            ) : (
              <Button
                iconsSize={iconsSize}
                icon={Save}
                color="border-brand text-brand hover:bg-brand"
                label={"SALVAR"}
                onClick={handleSave}
                disabled={isLoadingCredential}
              />
            )}

            {!isLoadingCredential && (
              <Button
                iconsSize={iconsSize}
                icon={X}
                color="border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                label={"CANCELAR"}
                onClick={handleCancel}
              />
            )}
          </>
        ) : !tempVault.isDeleted ? (
          <>
            <Button
              iconsSize={iconsSize}
              icon={Pencil}
              color="border-brand text-brand hover:bg-brand"
              label={"EDITAR"}
              onClick={handleEditClick}
            />

            <Button
              iconsSize={iconsSize}
              icon={Trash2}
              color="border-red-alert text-red-alert hover:bg-red-alert"
              label={"APAGAR"}
              onClick={() =>
                window.confirm("Mover para a lixeira?") && handleSave()
              }
            />
          </>
        ) : (
          <>
            <Button
              iconsSize={iconsSize}
              icon={Undo2}
              color="border-green-500 text-green-500 hover:bg-green-600"
              label={"RESTAURAR"}
              onClick={() => {
                setTempVault({ ...tempVault, isDeleted: false });
                handleSave(tempVault);
              }}
            />

            <Button
              iconsSize={iconsSize}
              icon={Trash2}
              color="border-red-alert text-red-alert hover:bg-red-alert"
              label={"DELETAR"}
              onClick={() =>
                window.confirm("Deletar permanentemente?") && handleSave()
              }
            />
          </>
        )}
      </div>
    </div>
  );
};
