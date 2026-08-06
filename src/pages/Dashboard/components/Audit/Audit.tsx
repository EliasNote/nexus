import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";
import {
  AlertCircle,
  Clock,
  Database,
  Files,
  Shield,
  ShieldQuestionMark,
  TriangleAlert,
} from "lucide-react";
import { AuditTypeCard } from "./components/AuditTypeCard";
import type { AuditType } from "@/types/types";
import { useState } from "react";
import { AuditCredential } from "./components/AuditCredential";
import { REUSED_GROUP_COLORS } from "@/utils/constants";

const getReusedColorClass = (ids?: string[]) => {
  if (!ids?.length) return undefined;

  const groupKey = [...ids].sort().join(":");
  const colorIndex = [...groupKey].reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  return REUSED_GROUP_COLORS[colorIndex % REUSED_GROUP_COLORS.length];
};
export const Audit = ({
  onChangeCredential,
}: {
  onChangeCredential: (credentialId: string) => void;
}) => {
  const vault = useCloudStore((state) => state.vault);
  const summaryEntries = useCloudStore((state) => state.summaryVault?.entries);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);
  const [selectedOptionId, setSelectedOptionId] = useState("compromised");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const auditTypesData: AuditType[] = [
    {
      id: "compromised",
      name: "VAZAMENTOS",
      phrase:
        "Estas senhas foram encontradas em vazamentos de dados públicos conhecidos. Altere-as imediatamente.",
      icon: Database,
      total:
        summaryEntries?.filter((entry) => entry.auditData?.isCompromised)
          ?.length ?? 0,
    },
    {
      id: "weak",
      name: "FRACAS",
      phrase: "Senhas fracas devem ser substituídas por senhas mais fortes.",
      icon: TriangleAlert,
      total:
        summaryEntries?.filter((entry) => entry.auditData?.isWeak)?.length ?? 0,
    },
    {
      id: "reused",
      name: "REUTILIZADAS",
      phrase:
        "O uso da mesma senha em múltiplos serviços aumenta o risco de efeito dominó em caso de vazamento.",
      icon: Files,
      total:
        summaryEntries?.filter((entry) => entry.auditData?.isReused)?.length ??
        0,
    },
    {
      id: "renewal",
      name: "RENOVAÇÃO",
      phrase:
        "É recomendado que senhas que não são alteradas há mais de 90 dias sejam renovadas preventivamente.",
      icon: Clock,
      total:
        summaryEntries?.filter((entry) => entry.auditData?.isRenewal)?.length ??
        0,
    },
  ];

  const colorClasses: Record<
    string,
    { text: string; border: string; border20: string; bg05: string }
  > = {
    compromised: {
      text: "text-red-500",
      border: "border-red-500",
      border20: "border-red-500/20",
      bg05: "bg-red-500/5",
    },
    weak: {
      text: "text-orange-500",
      border: "border-orange-500",
      border20: "border-orange-500/20",
      bg05: "bg-orange-500/5",
    },
    reused: {
      text: "text-yellow-500",
      border: "border-yellow-500",
      border20: "border-yellow-500/20",
      bg05: "bg-yellow-500/5",
    },
    renewal: {
      text: "text-gray-500",
      border: "border-gray-500",
      border20: "border-gray-500/20",
      bg05: "bg-gray-500/5",
    },
  };

  const handleSelectOption = (id: string) => {
    setSelectedOptionId(id);
  };

  const handleCheckPasswords = async () => {
    if (!vault || isChecking) return;

    try {
      setIsChecking(true);
      setCheckError(null);
      const updatedSummary = await cryptoService.getInitialData(vault);
      setSummaryVault(updatedSummary);
    } catch (error) {
      console.error(error);
      setCheckError("Não foi possível verificar as senhas agora.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="flex flex-col items-center h-full w-full p-10">
      <div className="max-w-[700px] w-full h-full flex flex-col gap-5">
        <div className="flex items-center flex-col w-full">
          <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex gap-1 items-center justify-center">
              <Shield size={32} className="text-brand" />
              <h2 className="text-[24px] text-white font-bold">
                AUDITORIA DE SEGURANÇA
              </h2>
            </div>
            <button
              disabled={!vault || isChecking}
              onClick={handleCheckPasswords}
              className="flex items-center border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 text-white h-fit gap-2 px-4 py-3 cursor-pointer"
            >
              {isChecking ? "VERIFICANDO..." : "VERIFICAR SENHAS"}
              <ShieldQuestionMark className="ml-2" strokeWidth={2} size={22} />
            </button>
          </div>
          <div className="flex flex-row w-full border border-zinc-800">
            {auditTypesData.map((data, index) => (
              <AuditTypeCard
                className={`${colorClasses[data.id].border} ${colorClasses[data.id].text}`}
                selectedId={selectedOptionId}
                key={index}
                data={data}
                onClick={() => handleSelectOption(data.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-start gap-3 w-full">
          <div className="flex flex-row border-l-4 border-brand text-white font-bold pl-2 text-[18px]">
            TODOS OS ITENS
          </div>
          <div
            className={`flex flex-row items-center p-2 gap-2 border text-[12px] ${colorClasses[selectedOptionId].border20} ${colorClasses[selectedOptionId].bg05} ${colorClasses[selectedOptionId].text}`}
          >
            <AlertCircle />
            {checkError ||
              auditTypesData
                .filter((x) => x.id === selectedOptionId)
                .map((data) => data.phrase)}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-h-full overflow-y-auto">
          {summaryEntries
            ?.filter((x) => !x.isDeleted)
            ?.filter((entry) => {
              if (selectedOptionId === auditTypesData[0].id)
                return entry.auditData?.isCompromised;
              if (selectedOptionId === auditTypesData[1].id)
                return entry.auditData?.isWeak;
              if (selectedOptionId === auditTypesData[2].id)
                return entry.auditData?.isReused;
              if (selectedOptionId === auditTypesData[3].id)
                return entry.auditData?.isRenewal;
              return true;
            })
            .map((entry) => (
              <AuditCredential
                key={entry.id}
                entrySummary={entry}
                onChangeCredential={onChangeCredential}
                reusedColorClass={
                  selectedOptionId === "reused"
                    ? getReusedColorClass(entry.reusedIds)
                    : undefined
                }
              />
            ))}
        </div>
      </div>
    </section>
  );
};
