import type { AuditType } from "@/types/types";

export const AuditTypeCard = ({
  data,
  className,
  selectedId,
  onClick,
}: {
  data: AuditType;
  className?: string;
  selectedId: string;
  onClick: () => void;
}) => {
  return (
    <div
      className={`flex-1 flex flex-col items-center gap-4 py-2 ${selectedId === data.id ? `${className} bg-zinc-900 border-b-2` : "text-zinc-600"} cursor-pointer`}
      onClick={onClick}
    >
      <div key={data.name} className="flex gap-2 flex-row items-center">
        <data.icon size={20} />
        <span
          className={`${selectedId === data.id ? "text-white font-bold" : ""}`}
        >
          {data.name}
        </span>
      </div>
      <span>{data.total}</span>
    </div>
  );
};
