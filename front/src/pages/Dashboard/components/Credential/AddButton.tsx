import { Plus } from "lucide-react";

export const AddButton = () => {
  return (
    <button className="flex gap-[5px] py-[10px] px-[15px] pl-[10px] bg-brand items-center justify-center text-[20px] text-white">
      <Plus size={32} />
      ADICIONAR
    </button>
  );
};
