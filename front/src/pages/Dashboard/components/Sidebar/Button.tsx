export const Button = ({
  id,
  selectedId,
  title,
  setSelected,
  icon,
  onClick,
}: {
  id: number | string;
  selectedId: number | string;
  title: string;
  setSelected: (id: number | string) => void;
  icon: React.ReactNode;
  onClick?: () => void;
}) => {
  const isSelected = id === selectedId;
  const iconStyle = `font-medium ${isSelected ? "text-brand" : "text-zinc-500 group-hover:text-zinc-400 "}`;

  return (
    <button
      className={`group flex items-center px-[16px] py-[8px] gap-[16px] w-[248px] h-fit text-[14px] cursor-pointer border-l-3 ${isSelected ? "border-l-brand bg-zinc-800" : "border-l-transparent hover:border-l-zinc-700 hover:bg-zinc-900"}`}
      onClick={() => {
        setSelected(id);
        onClick?.();
      }}
    >
      <span className={iconStyle}>{icon}</span>
      <span
        className={`font-medium truncate ${isSelected ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"}`}
      >
        {title}
      </span>
    </button>
  );
};
