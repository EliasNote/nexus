import type { AuditType } from "@/utils/types";

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
      data-selected={selectedId === data.id}
      className={`audit-type-card flex-1 flex flex-col items-center gap-4 py-2 ${selectedId === data.id ? `${className} bg-surface border-b-2` : "text-faint"} cursor-pointer`}
      onClick={onClick}
    >
      <div key={data.name} className="flex gap-2 flex-row items-center">
        <data.icon size={20} />
        <span
          className={`${selectedId === data.id ? "text-primary font-bold" : ""}`}
        >
          {data.name}
        </span>
      </div>
      <span>{data.total}</span>
    </div>
  );
};
