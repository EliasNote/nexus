import type { Credential, CredentialType, CredentialSummary } from "@/utils/vault";
import { AddButton } from "../AddButton";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const Footer = ({
  isCreate,
  tempCredential,
  summaryCredential,
  handleStartCreate,
}: {
  isCreate: CredentialType | null;
  tempCredential: Credential;
  summaryCredential: CredentialSummary | undefined;
  handleStartCreate: (type: CredentialType) => void;
}) => {
  const isCompromised = summaryCredential?.auditInfo?.isCompromised;

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-t border-line bg-transparent px-[40px] py-[30px]"
    >
      {!isCreate && (
        <>
          <div className="flex flex-col text-[14px] text-muted w-full">
            <span>
              CRIADO:
              {`${new Date(tempCredential?.createdAt).toLocaleDateString("pt-BR")}, ${new Date(tempCredential?.createdAt).toLocaleTimeString("pt-BR")}`}
            </span>
            <span>
              MODIFICADO:
              {`${new Date(tempCredential?.updatedAt).toLocaleDateString("pt-BR")}, ${new Date(tempCredential?.updatedAt).toLocaleTimeString("pt-BR")}`}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 font-medium min-w-[180px] [[data-theme=light]_&]:[--success-text:#15803d]">
            {isCompromised ? (
              <ShieldAlert className="text-red-600" strokeWidth={1} size={50} />
            ) : (
              <ShieldCheck className="text-success" strokeWidth={1} size={50} />
            )}

            <span className={isCompromised ? "text-red-alert" : "text-success"}>
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
