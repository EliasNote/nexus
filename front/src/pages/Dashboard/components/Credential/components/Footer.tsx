import type { Credential, CredentialType } from "@/types/vault";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { AddButton } from "../AddButton";

export const Footer = ({
  isCreate,
  tempVault,
  handleStartCreate,
}: {
  isCreate: CredentialType | null;
  tempVault: Credential;
  handleStartCreate: (type: CredentialType) => void;
}) => {
  const isWeak = tempVault?.audit?.weak;

  return (
    <div
      className={`w-full flex justify-between items-center border-t border-zinc-800 px-[40px] py-[30px]`}
    >
      {!isCreate && (
        <>
          <div className="flex flex-col text-[14px] text-zinc-400 w-full">
            <span>
              CRIADO:
              {`${new Date(tempVault?.createdAt).toLocaleDateString("pt-BR")}, ${new Date(tempVault?.createdAt).toLocaleTimeString("pt-BR")}`}
            </span>
            <span>
              MODIFICADO:
              {`${new Date(tempVault?.updatedAt).toLocaleDateString("pt-BR")}, ${new Date(tempVault?.updatedAt).toLocaleTimeString("pt-BR")}`}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 font-medium  min-w-[180px]">
            {isWeak ? (
              <ShieldAlert className="text-red-600" strokeWidth={1} size={50} />
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
        </>
      )}
      <div className="flex justify-end w-full">
        <AddButton handleStartCreate={handleStartCreate} />
      </div>
    </div>
  );
};
