import type { EntrySummary } from "@/types/vault";

export const AuditCredential = ({
  entrySummary,
  onChangeCredential,
  reusedColorClass = "border-zinc-800 text-white",
}: {
  entrySummary: EntrySummary;
  onChangeCredential: (credentialId: string) => void;
  reusedColorClass?: string;
}) => {
  return (
    <div
      className={`flex flex-row items-center justify-between border p-[12px] ${reusedColorClass}`}
    >
      <div className="flex gap-2">
        <div className="flex items-center justify-center h-[38px] w-[38px] border border-zinc-700 bg-zinc-900 text-white">
          {entrySummary.title?.[0]}
        </div>
        <div className="flex flex-col">
          <span className="text-white text-[14px]">{entrySummary.title}</span>
          <span className="text-zinc-600 text-[12px]">
            {entrySummary.username ?? entrySummary.holderName ?? entrySummary.name}
          </span>
        </div>
      </div>
      <button
        className="text-white px-[14px] py-[8px] font-bold border border-zinc-700 hover:border-zinc-600 text-[14px] cursor-pointer hover:bg-zinc-900"
        onClick={() => onChangeCredential(entrySummary.id)}
      >
        ALTERAR
      </button>
    </div>
  );
};

