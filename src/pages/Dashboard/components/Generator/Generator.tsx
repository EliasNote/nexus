import { ArrowRight, Binary, Check, Copy, RefreshCw } from "lucide-react";
import { Input } from "../Credential/components/Input";
import generator from "generate-password-ts";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GeneratorOptions } from "./Components/GeneratorOptions";

export const Generator = ({
  onChange,
  onClick,
}: {
  onChange?: (value: string) => void;
  onClick?: () => void;
}) => {
  const [passlength, setPasslength] = useState(10);
  const minLength = 4;
  const maxLength = 128;

  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [seed, setSeed] = useState(0);

  const [copied, setCopied] = useState(false);

  const values: Record<string, [boolean, (checked: boolean) => void]> = {
    lowercase: [lowercase, setLowercase],
    uppercase: [uppercase, setUppercase],
    numbers: [numbers, setNumbers],
    symbols: [symbols, setSymbols],
  };

  const handleToggle = (value: string) => {
    const selected = values[value];
    const othersSelected: boolean[] = [];

    for (const v of Object.values(values)) {
      if (v[0]) othersSelected.push(v[0]);
    }

    if (othersSelected.length === 1 && selected[0]) return;

    selected[1](!selected[0]);
  };

  const password = useMemo(() => {
    try {
      return generator.generate({
        length: passlength,
        numbers: numbers,
        symbols: symbols,
        uppercase: uppercase,
        lowercase: lowercase,
        strict: true,
        excludeSimilarCharacters: true,
      });
    } catch (e) {
      console.log(e);
      return;
    }
  }, [passlength, numbers, symbols, uppercase, lowercase, seed]);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(password!);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <section className="flex justify-center w-full p-7">
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
            passlength={passlength}
            setPasslength={setPasslength}
            minLength={minLength}
            maxLength={maxLength}
            handleToggle={handleToggle}
            lowercase={lowercase}
            uppercase={uppercase}
            numbers={numbers}
            symbols={symbols}
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
