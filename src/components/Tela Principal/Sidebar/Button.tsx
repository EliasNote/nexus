import { LayoutGrid } from "lucide-react";

export const Button = ({
  id,
  selectedId,
  title,
  setSelected,
}: {
  id: number;
  selectedId: number;
  title: string;
  setSelected: (id: number) => void;
}) => {
  const isSelected = id === selectedId;

  return (
    <button
      className="group flex items-center px-[16px] py-[8px] gap-[16px] w-[248px] h-fit text-[14px] text-white hover:bg-zinc-800 cursor-pointer border-l-3 border-l-transparent hover:border-l-zinc-700"
      onClick={() => setSelected(id)}
    >
      <LayoutGrid
        className={`group-hover:text-zinc-400 font-medium ${isSelected ? "text-brand" : "text-zinc-500"}`}
      />
      <span
        className={` group-hover:text-zinc-400 font-medium ${isSelected ? "text-white" : "text-zinc-500"}`}
      >
        {title}
      </span>
    </button>
  );
};
