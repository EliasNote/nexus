import type { LucideIcon } from "lucide-react";
import { Check, EyeClosed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../../../../../utils/utils";
import type { iconsInputProp } from "@/types/types";
import { Generator } from "../../Generator/Generator";

export const Input = ({
  iconsInput,
  iconTop: Icontop,
  topName,
  placeholder,
  disabled,
  value,
  isPassword,
  onChange,
  autoFocus,
  isEdit,
  isCreate,
}: {
  iconsInput?: iconsInputProp[];
  iconTop?: LucideIcon;
  topName?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  isPassword?: boolean;
  onChange?: (val: string) => void;
  autoFocus?: boolean;
  isEdit?: boolean;
  isCreate?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [isGenerate, setIsGenerate] = useState(false);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus();
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
    <div className="flex w-full items-center justify-center">
      <div className="flex gap-0.5 flex-col w-full max-w-[760px]">
        <div className="flex items-start font-medium gap-1 text-[12px] text-zinc-400">
          {Icontop && <Icontop size={16} strokeWidth={1.5} />}
          <span>{topName}</span>
        </div>
        <div className="group flex items-center focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 h-[45px]">
          <input
            ref={inputRef}
            disabled={disabled}
            className="flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-500"
            type={isPassword ? (showPassword ? "text" : "password") : "text"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {iconsInput?.map((icon, index) => {
            if (icon.id === "generate" && !isEdit && !isCreate) return null;

            return (
              <button
                type="button"
                key={index}
                onClick={() => {
                  if (icon.id === "eye") togglePasswordVisibility();
                  if (icon.id === "generate") setIsGenerate(!isGenerate);
                  if (icon.id === "copy") handleCopy(value ?? "");
                }}
                className="flex items-center justify-center border-l border-zinc-800 group-focus-within:border-zinc-600 h-full w-12 hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 hover:text-brand"
              >
                {icon.id === "eye" &&
                  (showPassword ? (
                    <EyeClosed size={20} strokeWidth={2} />
                  ) : (
                    <icon.icon size={20} strokeWidth={2} />
                  ))}
                {icon.id === "generate" && (
                  <icon.icon size={20} strokeWidth={2} />
                )}
                {icon.id === "copy" &&
                  (copied ? (
                    <Check
                      className="text-green-500"
                      size={20}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <icon.icon size={20} strokeWidth={2} />
                  ))}
              </button>
            );
          })}
        </div>
      </div>
      {isGenerate && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => setIsGenerate(false)}
        >
          <div
            className="w-full max-w-[700px] border border-zinc-800 bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Generator
              onChange={onChange}
              onClick={() => setIsGenerate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
