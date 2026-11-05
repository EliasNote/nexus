import {
  CREDENTIAL_TYPES_LABELS,
  type AuditInfo,
  type Credential,
  type CredentialSummary,
  type CredentialType,
} from "@/utils/vault";
import { Trash2, Pencil, X, Save, RefreshCcw, Undo2 } from "lucide-react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { motion } from "motion/react";
import { Button } from "./components/Button";
import { useVaultActions } from "@/hooks/useVaultActions";
import { useEffect, useRef } from "react";
import { getCryptoService } from "@/hooks/useCloudStore";

export const Header = ({
  originalCredential,
  tempCredential,
  setTempCredential,
  summaryCredential,
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
  originalCredential: Credential;
  tempCredential: Credential;
  setTempCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
  summaryCredential: CredentialSummary | undefined;
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
    let auditInfo: AuditInfo | null = null;
    let isPasswordChanged = false;

    if (tempCredential.type === "login") {
      const newPassword = tempCredential.password ?? "";
      const originalPassword = originalCredential?.password ?? "";

      isPasswordChanged = isCreate ? Boolean(newPassword) : newPassword !== originalPassword;

      if (newPassword && (isPasswordChanged || !summaryCredential?.auditInfo)) {
        const isCompromised = await getCryptoService().verifyCompromised(newPassword);
        const isWeak = await getCryptoService().verifyWeak(newPassword);

        auditInfo = {
          isCompromised,
          isWeak,
          reusedsIds: isPasswordChanged ? [] : (summaryCredential?.auditInfo?.reusedsIds ?? []),
          isRenewal: false,
        };
      }
    }

    await saveCredential(
      tempCredential,
      isTrashed,
      isRestore,
      auditInfo,
      isPasswordChanged,
    );

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
    await deleteCredential(tempCredential?.id);

    handleRemoveCredential();
    setIsEdit(false);
    setIsCreate(null);
  };

  return (
    <div className="flex flex-row w-full justify-between px-10 py-7.5 border-b border-line shrink-0">
      <div className="flex gap-2.5">
        <div className="w-15 h-15 flex items-center justify-center text-[32px] bg-surface border border-line text-secondary">
          {(tempCredential?.title?.[0] || "?").toUpperCase()}
        </div>

        <div className="flex flex-col items-start" onDoubleClick={() => !isWriting && handleEditClick()}>
          {isWriting ? (
            <div className="group flex items-center focus-within:border-line-focus bg-surface border border-line h-[35px] w-full min-w-[300px]">
              <input
                ref={titleInputRef}
                type="text"
                className={`flex-1 bg-transparent px-3 text-[16px] text-primary font-bold outline-none placeholder:text-muted ${!isWriting ? "pointer-events-none" : ""}`}
                value={tempCredential?.title || ""}
                onChange={(e) =>
                  setTempCredential((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
                placeholder="Título da credencial"
              />
            </div>
          ) : (
            <h2 className="text-[18px] text-secondary font-bold max-w-100 truncate cursor-default">
              {tempCredential?.title}
            </h2>
          )}

          <div className="flex">
            <span className="flex items-center justify-center px-3 py-1 bg-surface border border-line text-muted text-[14px] font-bold uppercase">
              {CREDENTIAL_TYPES_LABELS[tempCredential?.type ?? ""]}
            </span>

            <button
              className={`flex items-center justify-center px-3 py-1 ${isWriting ? "cursor-pointer" : "cursor-default"}`}
              disabled={!isWriting}
              onClick={() =>
                setTempCredential({
                  ...tempCredential!,
                  isFavorite: !tempCredential?.isFavorite,
                })
              }
            >
              {tempCredential?.isFavorite ? (
                <StarSolid className="text-amber-400 size-[25px]" />
              ) : (
                <StarOutline className="text-faint size-[25px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 items-center justify-center text-[14px]">
        {!isCreate && (
          <Button
            iconsSize={iconsSize}
            className="credential-back-button"
            color="border-line bg-surface text-muted transition-colors hover:border-line-focus hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
                color="border-line-strong text-secondary hover:bg-surface-active"
                label={"CANCELAR"}
                onClick={handleCancel}
              />
            )}
          </>
        ) : !tempCredential.isDeleted ? (
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
              color="border-green-500 text-success hover:bg-green-600"
              label={"RESTAURAR"}
              onClick={() => {
                setTempCredential({ ...tempCredential, isDeleted: false });
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
