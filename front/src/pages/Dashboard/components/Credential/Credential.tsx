import type { VaultEntry } from "@/types/vault";
import { Login } from "./Login";
import { Trash2, Pencil, ShieldCheck } from "lucide-react";
import { AddButton } from "./AddButton";

export const Credential = ({ credential }: { credential?: VaultEntry }) => {
  const iconsSize = 18;
  const px = 40;
  const py = 30;
  return (
    <section className="flex flex-col w-full">
      {credential ? (
        <>
          <div
            className={`flex flex-row w-full h-fit justify-between px-[${px}px] py-[${py}px] border-b border-zinc-800`}
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
              <button className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-brand text-brand hover:bg-brand hover:text-white cursor-pointer">
                <Pencil size={iconsSize} />
                EDITAR
              </button>
              <button className="flex gap-[5px] items-center px-[14px] py-[8px] border-[2px] font-bold border-red-alert text-red-alert hover:bg-red-alert hover:text-white cursor-pointer">
                <Trash2 size={iconsSize} />
                APAGAR
              </button>
            </div>
          </div>
          <div>{credential?.type === "login" && <Login />}</div>
          <div
            className={`w-full flex justify-between border-t border-zinc-800 px-[${px}px] py-[${py}px]`}
          >
            <div className="flex flex-col text-zinc-400">
              <span>
                CRIADO:
                {`${new Date(credential?.createdAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.createdAt).toLocaleTimeString("pt-BR")}`}
              </span>
              <span>
                MODIFICADO:
                {`${new Date(credential?.updatedAt).toLocaleDateString("pt-BR")}, ${new Date(credential?.updatedAt).toLocaleTimeString("pt-BR")}`}
              </span>
            </div>
            <div className="">
              <ShieldCheck
                className="text-green-500"
                strokeWidth={1.3}
                size={50}
              />
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
