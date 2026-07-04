import { useCloudStore } from "@/hooks/useCloudStore";

export const Audit = () => {
  const summaryEntries = useCloudStore((state) => state.summaryVault?.entries);
  return (
    <div id="audit">
      {summaryEntries &&
        summaryEntries.map((entry) => (
          <div
            key={entry.id}
            className="text-white border-b border-zinc-800 p-2"
          >
            <p>Título: {entry.title}</p>
            <span>
              Comprometida: {entry.auditData?.isCompromised ? "SIM" : "NÃO"}
            </span>{" "}
            |
            <span>
              Reutilizada: {entry.auditData?.isReused ? "SIM" : "NÃO"}
            </span>{" "}
            |<span>Fraca: {entry.auditData?.isWeak ? "SIM" : "NÃO"}</span> |
            <span>Expirada: {entry.auditData?.isRenewal ? "SIM" : "NÃO"}</span>
          </div>
        ))}
    </div>
  );
};
