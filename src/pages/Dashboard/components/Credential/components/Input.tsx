import type { LucideIcon } from "lucide-react";
import { AlertCircle, Check, Eye, EyeClosed } from "lucide-react";
import { motion } from "framer-motion";
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
  errorContent,
  onDoubleClick,
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
  errorContent?: string | null;
  onDoubleClick?: () => void;
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

  useEffect(() => {
    if (errorContent && !disabled) inputRef.current?.focus();
  }, [errorContent, disabled]);

  const handleCopy = async (value: string) => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="flex w-full items-center justify-center"
      onDoubleClick={onDoubleClick}>
      <div className="flex gap-0.5 flex-col w-full max-w-[760px]">
        <div className="flex items-start font-medium gap-1 text-[12px] text-zinc-400">
          {Icontop && <Icontop size={16} strokeWidth={1.5} />}
          <span>{topName}</span>
        </div>
        <motion.div
          animate={errorContent ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`group flex h-[45px] items-center border bg-zinc-900 transition-[border-color,box-shadow] duration-200 ${errorContent ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)] focus-within:border-red-400" : "border-zinc-800 focus-within:border-zinc-600"}`}
        >
          <input
            ref={inputRef}
            disabled={disabled}
            className={`flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-500 ${disabled ? "pointer-events-none" : ""}`}
            type={isPassword ? (showPassword ? "text" : "password") : "text"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            aria-invalid={Boolean(errorContent)}
            aria-describedby={errorContent ? "input-error-message" : undefined}
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
                className={`flex h-full w-12 cursor-pointer items-center justify-center border-l transition-colors hover:bg-zinc-800 hover:text-brand ${errorContent ? "border-red-500 text-red-400" : "border-zinc-800 text-zinc-600 group-focus-within:border-zinc-600"}`}
              >
                {icon.id === "eye" &&
                  (showPassword ? (
                    <Eye size={20} strokeWidth={2} />
                  ) : (
                    <EyeClosed size={20} strokeWidth={2} />
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
        </motion.div>
        {errorContent && (
          <motion.div id="input-error-message" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
            <AlertCircle size={15} strokeWidth={2.25} aria-hidden="true" />
            <span>{errorContent}</span>
          </motion.div>
        )}
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
