import { Copy, type LucideIcon } from "lucide-react";

interface TextAreaProps {
  iconTop: LucideIcon;
  topName: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
}

export const TextArea = ({
  iconTop: IconTop,
  topName,
  placeholder,
  disabled,
  value,
}: TextAreaProps) => {
  return (
    <div className="flex flex-col gap-0.5 w-full max-w-[760px]">
      <span className="text-[12px] text-zinc-400 font-medium flex items-start gap-1">
        <IconTop size={16} strokeWidth={1.5} />
        <span>{topName}</span>
      </span>

      <div className="group relative flex flex-col bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 transition-colors w-full min-h-[200px]">
        <textarea
          className="flex-1 bg-transparent text-[14px] px-3 py-2 text-white outline-none placeholder:text-zinc-500 resize-none no-scrollbar text-sm"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
        />
        <button
          className="absolute top-1 right-1 flex items-center justify-center h-10 w-10 bg-zinc-900 border border-zinc-800 group-focus-within:border-zinc-600 hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 hover:text-brand"
          title="Copiar anotações"
        >
          <Copy size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
