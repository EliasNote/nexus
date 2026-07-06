import type { EntrySummary } from "@/types/vault";

export const AuditCredential = ({
  selectedId,
  entrySummary,
  onClick,
}: {
  selectedId: string;
  entrySummary: EntrySummary;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex flex-row items-center justify-between border border-zinc-800 p-[12px]"
      onClick={onClick}
    >
      <div className="flex gap-2">
        <div className="flex items-center justify-center h-[38px] w-[38px] bg-zinc-900 border border-zinc-700 text-white">
          {entrySummary.title?.[0]}
        </div>
        <div className="flex flex-col">
          <span className="text-white text-[14px]">{entrySummary.title}</span>
          <span className="text-zinc-600 text-[12px]">
            {entrySummary.username}
          </span>
        </div>
      </div>
      <button className="text-white px-[14px] py-[8px] font-bold border border-zinc-800 text-[14px] cursor-pointer hover:bg-zinc-900">
        ALTERAR
      </button>
    </div>
  );
};
