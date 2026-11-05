import { copyToClipboard } from "@/utils/utils";
import { Copy, Check, type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { IconButton } from "./IconButton";

export const TextArea = ({
  iconTop: IconTop,
  topName,
  placeholder,
  disabled,
  value,
  onChange,
  autoFocus,
  onDoubleClick,
}: {
  iconTop: LucideIcon;
  topName: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  autoFocus?: boolean;
  onDoubleClick?: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && !disabled) {
      textAreaRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  const handleCopy = async (value: string) => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-0.5 w-full max-w-[760px]" onDoubleClick={onDoubleClick}>
      <span className="text-[12px] text-muted font-medium flex items-start gap-1">
        <IconTop size={16} strokeWidth={1.5} />
        <span>{topName}</span>
      </span>

      <div className="group relative flex flex-col bg-surface border border-line focus-within:border-line-focus transition-colors w-full min-h-[200px]">
        <textarea
          ref={textAreaRef}
          className={`flex-1 bg-transparent text-[14px] px-3 py-2 text-primary outline-none placeholder:text-muted resize-none no-scrollbar text-sm ${disabled ? "pointer-events-none" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <IconButton
          className="absolute top-1 right-1 flex items-center justify-center h-10 w-10 bg-surface border border-line group-focus-within:border-line-focus hover:bg-surface-raised transition-colors cursor-pointer text-faint hover:text-brand"
          onClick={() => handleCopy(value!)}>
          {copied ? (
            <Check className="text-success" size={20} strokeWidth={2.5} />
          ) : (
            <Copy size={20} strokeWidth={2} />
          )}
        </IconButton>
      </div>
    </div>
  );
};
