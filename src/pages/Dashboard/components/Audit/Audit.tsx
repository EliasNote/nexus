import { useCloudStore } from "@/hooks/useCloudStore";
import {
  AlertCircle,
  Clock,
  Database,
  Files,
  Shield,
  TriangleAlert,
} from "lucide-react";
import { AuditTypeCard } from "./components/AuditTypeCard";
import type { AuditType } from "@/types/types";
import { useState } from "react";
import { AuditCredential } from "./components/AuditCredential";

export const Audit = () => {
  const summaryEntries = useCloudStore((state) => state.summaryVault?.entries);
  const [selectedOptionId, setSelectedOptionId] = useState("compromised");
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

  return (
    <section className="flex flex-col items-center h-screen w-full p-10">
      <div className="max-w-[700px] w-full h-full flex flex-col gap-5">
        <div className="flex items-center flex-col w-full">
          <div className="flex gap-1 items-center justify-center mb-8">
            <Shield size={32} className="text-brand" />
            <h2 className="text-[24px] text-white font-bold">
              AUDITORIA DE SEGURANÇA
            </h2>
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
            {auditTypesData
              .filter((x) => x.id === selectedOptionId)
              .map((data) => data.phrase)}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-h-full overflow-y-auto">
          {summaryEntries
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
                selectedId={entry.id}
                entrySummary={entry}
                onClick={() => {}}
              />
            ))}
        </div>
      </div>
    </section>
  );
};
