import type { VaultEntry } from "@/types/vault";
import { Login } from "./Login";
import { Trash2, Pencil, ShieldCheck, ShieldAlert } from "lucide-react";
import { AddButton } from "./AddButton";
import { useCloudStore } from "@/hooks/useCloudStore";
import { useState } from "react";

export const Credential = ({ credential }: { credential?: VaultEntry }) => {
  const iconsSize = 18;
  const isWeak = credential?.audit?.weak;
  const folders = useCloudStore((state) => state.vault?.folders || []);
  const [isEdit, setIsEdit] = useState(false);

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
                <span className="flex items-center justify-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[14px] font-bold">
                  {credential.type}
                </span>
              </div>
            </div>
            <div className="flex gap-[10px] items-center justify-center text-[14px]">
              <button
                onClick={() => setIsEdit(true)}
                className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer"
              >
                <Pencil size={iconsSize} />
                EDITAR
              </button>
              <button className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-red-alert text-red-alert hover:bg-red-alert hover:text-white cursor-pointer">
                <Trash2 size={iconsSize} />
                APAGAR
              </button>
            </div>
          </div>
          <div className="flex-1 h-full w-full flex flex-col">
            {credential?.type === "login" && (
              <Login folders={folders} isEdit={isEdit} />
            )}
          </div>
          <div
            className={`w-full flex justify-between items-center border-t border-zinc-800 px-[40px] py-[30px]`}
          >
            <div className="flex flex-col text-[14px] text-zinc-400">
              <span>
                CRIADO:
                {`${new Date(credential?.createdAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.createdAt).toLocaleTimeString("pt-BR")}`}
              </span>
              <span>
                MODIFICADO:
                {`${new Date(credential?.updatedAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.updatedAt).toLocaleTimeString("pt-BR")}`}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 font-medium">
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
            <AddButton />
          </div>
        </>
      ) : (
        <div></div>
      )}
    </section>
  );
};
