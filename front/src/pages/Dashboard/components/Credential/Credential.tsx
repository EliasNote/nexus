import type {
  LoginCredential,
  Credential as CredentialType,
} from "@/types/vault";
import { Login } from "./Login";
import {
  Trash2,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  X,
  Save,
} from "lucide-react";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { AddButton } from "./AddButton";
import { useCloudStore } from "@/hooks/useCloudStore";
import { useState } from "react";
import { useCloudSync } from "@/hooks/useCloudSync";
import { updateSummaryVaultCredential } from "@/utils/utils";

export const Credential = ({ credential }: { credential?: CredentialType }) => {
  const iconsSize = 18;
  const isWeak = credential?.audit?.weak;
  const vault = useCloudStore((state) => state.vault);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);

  const summaryVault = useCloudStore((state) => state.summaryVault);
  const setVault = useCloudStore((state) => state.setVault);
  const { uploadVault } = useCloudSync();
  const cryptoService = useCloudStore.getState().cryptoService;

  const folders = summaryVault?.folders ?? [];
  const [isEdit, setIsEdit] = useState(false);
  const [tempVault, setTempVault] = useState<CredentialType | null>(null);
  const isFavorite = isEdit
    ? (tempVault?.isFavorite ?? false)
    : (credential?.isFavorite ?? false);

  const handleEditClick = () => {
    setTempVault(credential || null);
    setIsEdit(true);
  };

  const handleSave = async () => {
    try {
      const newVault = await cryptoService.updateVaultFromCredential(
        vault,
        tempVault!,
      );
      const updatedSummaryVault = updateSummaryVaultCredential(
        summaryVault!,
        tempVault!,
      );

      await uploadVault(newVault);

      setVault(newVault);
      setSummaryVault(updatedSummaryVault);
      setIsEdit(false);
      console.log("Salvo com sucesso na nuvem e localmente!");
    } catch (error) {
      console.error("Erro ao salvar no GitHub. Tentando recuperar...", error);
      alert(
        "Erro ao sincronizar. Verifique sua conexão ou tente salvar novamente.",
      );
    }
  };

  return (
    <section className="flex flex-col h-screen w-full">
      {credential ? (
        <>
          <div
            className={`flex flex-row w-full justify-between px-[40px] py-[30px] border-b border-zinc-800`}
          >
            <div className="flex gap-[10px]">
              <div className="w-[60px] h-[60px] flex items-center justify-center text-[32px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                {credential?.title[0].toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[18px] text-zinc-300 font-bold">
                  {credential?.title}
                </h2>
                <div className="flex">
                  <span className="flex items-center justify-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[14px] font-bold">
                    {credential.type}
                  </span>
                  <button
                    className={`flex items-center justify-center px-3 py-1 ${isEdit && "cursor-pointer"}`}
                    disabled={!isEdit}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempVault({
                        ...tempVault!,
                        isFavorite: !tempVault?.isFavorite,
                      });
                    }}
                  >
                    {isFavorite ? (
                      <StarSolid
                        strokeWidth={1.8}
                        className="text-amber-400 size-[25px]"
                      />
                    ) : (
                      <StarOutline
                        strokeWidth={1.8}
                        className="text-amber-400 size-[25px]"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-[10px] items-center justify-center text-[14px]">
              {isEdit ? (
                <button
                  onClick={handleSave}
                  className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer"
                >
                  <Save size={iconsSize} />
                  SALVAR
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer"
                >
                  <Pencil size={iconsSize} />
                  EDITAR
                </button>
              )}
              {isEdit ? (
                <button
                  onClick={() => setIsEdit(false)}
                  className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
                >
                  <X size={iconsSize} />
                  CANCELAR
                </button>
              ) : (
                <button
                  onClick={() => setIsEdit(false)}
                  className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-red-alert text-red-alert hover:bg-red-alert hover:text-white cursor-pointer"
                >
                  <Trash2 size={iconsSize} />
                  APAGAR
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 h-full w-full flex flex-col">
            {credential?.type === "login" && (
              <Login
                key={credential?.id}
                folders={folders}
                isEdit={isEdit}
                credential={
                  isEdit
                    ? (tempVault! as LoginCredential)
                    : (credential! as LoginCredential)
                }
                setCredential={setTempVault}
              />
            )}
          </div>
          <div
            className={`w-full flex justify-between items-center border-t border-zinc-800 px-[40px] py-[30px]`}
          >
            <div className="flex flex-col text-[14px] text-zinc-400 w-full">
              <span>
                CRIADO:
                {`${new Date(credential?.createdAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.createdAt).toLocaleTimeString("pt-BR")}`}
              </span>
              <span>
                MODIFICADO:
                {`${new Date(credential?.updatedAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.updatedAt).toLocaleTimeString("pt-BR")}`}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 font-medium  min-w-[180px]">
              {isWeak ? (
                <ShieldAlert
                  className="text-red-600"
                  strokeWidth={1}
                  size={50}
                />
              ) : (
                <ShieldCheck
                  className="text-green-500"
                  strokeWidth={1}
                  size={50}
                />
              )}

              <span className={`text-${isWeak ? "red-600" : "green-500"}`}>
                Senha {isWeak ? "Insegura" : "Segura"}
              </span>
            </div>
            <div className="flex justify-end w-full">
              <AddButton />
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </section>
  );
};
