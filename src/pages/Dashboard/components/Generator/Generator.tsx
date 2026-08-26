import { ArrowRight, Binary, Check, Copy, RefreshCw, X } from "lucide-react";
import { Input } from "../Credential/components/Input";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GeneratorOptions } from "./Components/GeneratorOptions";
import { copyToClipboard } from "@/utils/utils";
import { generateCustomPassword, type GeneratorConfig } from "@/hooks/usePasswordGenerator";

export const Generator = ({
  onChange,
  onClick,
  isCredential,
}: {
  onChange?: (value: string) => void;
  onClick?: () => void;
  isCredential?: boolean;
}) => {
  const [options, setOptions] = useState<GeneratorConfig>({
    length: 10,
    lowercase: true,
    minLowercase: 0,
    uppercase: true,
    minUppercase: 0,
    numbers: true,
    minNumbers: 0,
    symbols: true,
    minSymbols: 0,
    standardSymbols: false,
    includeChars: "",
    excludeAmbiguous: false,
    excludeChars: "",
  });
  const minLength = 4;
  const maxLength = 128;

  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleToggle = (key: string) => {
    const k = key as keyof GeneratorConfig;
    const booleanKeys: (keyof GeneratorConfig)[] = [
      "lowercase",
      "uppercase",
      "numbers",
      "symbols",
    ];

    const activeCount = booleanKeys.filter((b) => options[b]).length;

    if (activeCount === 1 && options[k]) return;

    setOptions((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const requiredMinLength = useMemo(() => {
    let count = 0;
    if (options.lowercase) count += Math.max(options.minLowercase, 1);
    if (options.uppercase) count += Math.max(options.minUppercase, 1);
    if (options.numbers) count += Math.max(options.minNumbers, 1);
    if (options.symbols) count += Math.max(options.minSymbols, 1);
    if (options.includeChars) count += options.includeChars.length;
    return count;
  }, [options]);

  const effectiveLength = Math.min(
    Math.max(options.length, requiredMinLength),
    maxLength
  );

  const password = useMemo(() => {
    try {
      return generateCustomPassword({
        ...options,
        length: effectiveLength,
      });
    } catch (e) {
      console.log(e);
      return "";
    }
  }, [options, effectiveLength, seed]);

  const handleCopy = async () => {
    setCopied(true);
    await copyToClipboard(password!);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <section className="flex justify-center w-full p-7 relative">
      {isCredential && <X className="absolute top-4 right-4 text-white cursor-pointer" onClick={onClick} />}
      <div className="flex items-center flex-col max-w-[700px] w-full gap-10">
        <div className="flex gap-1 items-center justify-center mb-[-20px]">
          <Binary size={32} className="text-brand" />
          <h2 className="text-[24px] text-white font-bold">
            GERADOR DE SENHAS
          </h2>
        </div>
        <div className="flex flex-col w-full gap-10">
          <Input value={password} />
          <GeneratorOptions
            options={{ ...options, length: effectiveLength }}
            setOptions={setOptions}
            handleToggle={handleToggle}
            minLength={minLength}
            maxLength={maxLength}
          />
          <div className="flex items-center justify-center gap-4">
            {onChange ? (
              <button
                className="group flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 cursor-pointer"
                onClick={() => {
                  onChange(password!);
                  onClick?.();
                }}
              >
                <span>UTILIZAR SENHA</span>
                <ArrowRight size={22} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 cursor-pointer"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check
                    className="text-green-500"
                    size={22}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Copy size={22} strokeWidth={2} />
                )}
                <span>COPIAR</span>
              </button>
            )}
            <motion.button
              className="group flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 cursor-pointer"
              onClick={() => setSeed((s) => s + 1)}
              whileHover="hovered"
            >
              <motion.div
                animate={{ rotate: seed * 360 }}
                variants={{
                  hovered: { rotate: seed * 360 + 90 },
                }}
                className="flex items-center justify-center"
              >
                <RefreshCw size={22} strokeWidth={2} />
              </motion.div>
              <span>REGERAR</span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};
