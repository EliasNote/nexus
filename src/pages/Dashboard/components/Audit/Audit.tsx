import { useCloudStore } from "@/hooks/useCloudStore";
import { Shield } from "lucide-react";

export const Audit = () => {
  const summaryEntries = useCloudStore((state) => state.summaryVault?.entries);
  return (
    <section className="flex justify-center h-screen w-full p-10">
      <div className="flex items-center flex-col max-w-[700px] w-full">
        <div className="flex gap-1 items-center justify-center">
          <Shield size={32} className="text-brand" />
          <h2 className="text-[24px] text-white font-bold">
            AUDITORIA DE SEGURANÇA
          </h2>
        </div>
        {summaryEntries &&
          summaryEntries.map((entry) => (
            <div
              key={entry.id}
              className="text-white border-b border-zinc-800 p-2"
            >
              <span>
                Comprometida: {entry.auditData?.isCompromised ? "SIM" : "NÃO"}
              </span>{" "}
              |
              <span>
                Reutilizada: {entry.auditData?.isReused ? "SIM" : "NÃO"}
              </span>{" "}
              |<span>Fraca: {entry.auditData?.isWeak ? "SIM" : "NÃO"}</span> |
              <span>
                Expirada: {entry.auditData?.isRenewal ? "SIM" : "NÃO"}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
};
