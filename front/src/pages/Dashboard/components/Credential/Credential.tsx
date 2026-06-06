import type { VaultEntry } from "@/types/vault";
import { Login } from "./Login";

export const Credential = ({ credential }: { credential?: VaultEntry }) => {
  return (
    <section className="flex w-full">
      {credential ? (
        <>
          <div className="flex flex-row w-full h-fit px-[40px] py-[30px] gap-[10px] border-b border-zinc-800">
            <div className="w-[60px] h-[60px] flex items-center justify-center text-[32px] bg-zinc-900 border border-zinc-800 text-zinc-300">
              {credential?.title[0].toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-[18px] text-zinc-300 font-bold">
                {credential?.title}
              </h2>
              <span className="flex items-center justify-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[14px] font-bold">
                {credential.type}
              </span>
            </div>
          </div>
          <div>{credential?.type === "login" && <Login />}</div>
        </>
      ) : (
        <div></div>
      )}
    </section>
  );
};
