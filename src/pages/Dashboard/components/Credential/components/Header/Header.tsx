import {
  CREDENTIAL_TYPES_LABELS,
  type Credential,
  type CredentialType,
} from "@/types/vault";
import { Trash2, Pencil, X, Save, RefreshCcw, Undo2 } from "lucide-react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Button } from "./components/Button";
import { useVaultActions } from "@/hooks/useVaultActions";
import { useEffect, useRef } from "react";

export const Header = ({
  tempVault,
  setTempVault,
  iconsSize,
  isLoadingCredential,
  handleRemoveCredential,
  isEdit,
  setIsEdit,
  isCreate,
  setIsCreate,
  handleEditClick,
  handleCancel,
  autoFocus,
}: {
  tempVault: Credential;
  setTempVault: React.Dispatch<React.SetStateAction<Credential | null>>;
  iconsSize: number;
  isLoadingCredential: boolean;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: CredentialType | null;
  setIsCreate: (isCreate: CredentialType | null) => void;
  handleEditClick: (id?: string) => void;
  handleCancel: () => void;
  handleRemoveCredential: () => void;
  autoFocus?: boolean;
}) => {
  const isWriting = isEdit || isCreate;
  const { saveCredential, deleteCredential } = useVaultActions();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && isWriting) {
      titleInputRef.current?.focus();
    }
  }, [autoFocus, isWriting]);
  const onSave = async (isTrashed: boolean, isRestore: boolean) => {
    await saveCredential(tempVault, isTrashed, isRestore);

    if (isTrashed) {
      handleRemoveCredential();
      return;
    }

    setIsEdit(false);
    setIsCreate(null);
  };

  const onUndo = () => {
    if (
      isEdit &&
      !window.confirm("Descartar as alterações e voltar?")
    ) {
      return;
    }

    setIsEdit(false);
    handleRemoveCredential();
  };

  const onDelete = async () => {
    await deleteCredential(tempVault?.id);

    handleRemoveCredential();
    setIsEdit(false);
    setIsCreate(null);
  };

  return (
    <div className="flex flex-row w-full justify-between px-10 py-7.5 border-b border-zinc-800">
      <div className="flex gap-2.5">
        <div className="w-15 h-15 flex items-center justify-center text-[32px] bg-zinc-900 border border-zinc-800 text-zinc-300">
          {(tempVault?.title?.[0] || "?").toUpperCase()}
        </div>

        <div className="flex flex-col items-start" onDoubleClick={() => !isWriting && handleEditClick()}>
          {isWriting ? (
            <div className="group flex items-center focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 h-[35px] w-full min-w-[300px]">
              <input
                ref={titleInputRef}
                type="text"
                className={`flex-1 bg-transparent px-3 text-[16px] text-white font-bold outline-none placeholder:text-zinc-500 ${!isWriting ? "pointer-events-none" : ""}`}
                value={tempVault?.title || ""}
                onChange={(e) =>
                  setTempVault((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
                placeholder="Título da credencial"
              />
            </div>
          ) : (
            <h2 className="text-[18px] text-zinc-300 font-bold max-w-100 truncate cursor-default">
              {tempVault?.title}
            </h2>
          )}

          <div className="flex">
            <span className="flex items-center justify-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[14px] font-bold uppercase">
              {CREDENTIAL_TYPES_LABELS[tempVault?.type ?? ""]}
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
        {!isCreate && (
          <Button
            iconsSize={iconsSize}
            color="border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            label={"VOLTAR"}
            icon={Undo2}
            onClick={onUndo}
          />
        )}
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
                onClick={() => onSave(false, false)}
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
                window.confirm("Mover para a lixeira?") && onSave(true, false)
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
                onSave(false, true);
              }}
            />

            <Button
              iconsSize={iconsSize}
              icon={Trash2}
              color="border-red-alert text-red-alert hover:bg-red-alert"
              label={"DELETAR"}
              onClick={() =>
                window.confirm("Deletar permanentemente?") && onDelete()
              }
            />
          </>
        )}
      </div>
    </div>
  );
};
