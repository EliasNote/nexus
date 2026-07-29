import type { Credential, CredentialType, EntrySummary } from "@/types/vault";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Shield, Check } from "@nsmr/pixelart-react";
import { AddButton } from "../AddButton";

export const Footer = ({
  isCreate,
  tempVault,
  summaryVault,
  handleStartCreate,
}: {
  isCreate: CredentialType | null;
  tempVault: Credential;
  summaryVault: EntrySummary | undefined;
  handleStartCreate: (type: CredentialType) => void;
}) => {
  const isCompromised = summaryVault?.auditData?.isCompromised;

  return (
    <div
      className={`w-full flex justify-between items-center border-t border-zinc-800 px-[40px] py-[30px] shrink-0`}
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
            {isCompromised ? (
              <ShieldAlert className="text-red-600" strokeWidth={1} size={50} />
            ) : (
              <div className="relative flex items-center justify-center h-[50px] w-[50px]">
                <Shield className="text-green-500" strokeWidth={1} size={50} />
                <Check className="text-green-500 absolute pb-1.5" strokeWidth={1} size={30} />
              </div>
            )}

            <span className={`text-${isCompromised ? "red-600" : "green-500"}`}>
              Senha {isCompromised ? "Comprometida" : "Segura"}
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
