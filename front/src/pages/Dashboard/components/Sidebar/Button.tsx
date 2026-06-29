export const Button = ({
  id,
  selectedId,
  title,
  setSelected,
  icon,
  onClick,
  isSyncButton,
  isSyncButtonAllowed,
}: {
  id: number | string;
  selectedId: number | string;
  title: string;
  setSelected: (id: number | string) => void;
  icon: React.ReactNode;
  onClick?: () => void;
  isSyncButton?: boolean;
  isSyncButtonAllowed?: boolean;
}) => {
  const isSelected = id === selectedId && !isSyncButton;
  const iconStyle = `font-medium ${isSelected ? "text-brand" : isSyncButtonAllowed ? "text-zinc-500 group-hover:text-brand" : "text-zinc-500 group-hover:text-zinc-400"}`;

  return (
    <button
      className={`group flex items-center px-[16px] py-[8px] gap-[16px] w-[248px] h-fit text-[14px] ${isSyncButton && !isSyncButtonAllowed ? "cursor-default" : "cursor-pointer"} border-l-3 ${isSelected ? "border-l-brand bg-zinc-800" : isSyncButtonAllowed ? "border-l-transparent hover:border-l-brand" : "border-l-transparent hover:border-l-zinc-700 hover:bg-zinc-900"}`}
      onClick={() => {
        setSelected(id);
        onClick?.();
      }}
    >
      <span className={iconStyle}>{icon}</span>
      <span
        className={`font-medium truncate ${isSelected ? "text-white" : isSyncButtonAllowed ? "text-zinc-500 group-hover:text-brand" : "text-zinc-500 group-hover:text-zinc-400"}`}
      >
        {title}
      </span>
    </button>
  );
};
