import type { LucideIcon } from "lucide-react";

export const Input = ({
  iconsInput,
  iconTop: Icontop,
  topName,
  placeholder,
  disabled,
}: {
  iconsInput: LucideIcon[];
  iconTop: LucideIcon;
  topName: string;
  placeholder: string;
  disabled?: boolean;
}) => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex gap-0.5 flex-col w-full max-w-[760px]">
        <div className="flex items-start font-medium gap-1 text-[12px] text-zinc-400">
          <Icontop size={16} strokeWidth={1.5} />
          <span>{topName}</span>
        </div>
        <div className="group flex items-center focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 h-[45px]">
          <input
            disabled={disabled}
            className="flex-1 bg-transparent px-3 text-white outline-none placeholder:text-zinc-500"
            type="text"
            placeholder={placeholder}
          />
          {iconsInput.map((Icon, index) => (
            <button
              key={index}
              className="flex items-center justify-center border-l border-zinc-800 group-focus-within:border-zinc-600 h-full w-12 hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 hover:text-brand"
            >
              <Icon size={20} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
