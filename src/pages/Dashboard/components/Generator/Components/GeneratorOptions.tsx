import * as Switch from "@radix-ui/react-switch";
import { RangeSlider } from "./RangeSlider";
import { SwitchButton } from "./SwitchButton";
import type { GeneratorConfig } from "@/hooks/usePasswordGenerator";

interface GeneratorOptionsProps {
  options: GeneratorConfig;
  setOptions: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  handleToggle: (value: string) => void;
  minLength: number;
  maxLength: number;
}

export const GeneratorOptions = ({
  options,
  setOptions,
  handleToggle,
  minLength,
  maxLength,
}: GeneratorOptionsProps) => {
  const handleMinChange = (
    val: string,
    key: keyof GeneratorConfig,
    maxLimit: number
  ) => {
    if (val === "") {
      setOptions((prev) => ({ ...prev, [key]: 0 }));
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const otherMins =
        (key !== "minLowercase" && options.lowercase ? Math.max(options.minLowercase, 1) : 0) +
        (key !== "minUppercase" && options.uppercase ? Math.max(options.minUppercase, 1) : 0) +
        (key !== "minNumbers" && options.numbers ? Math.max(options.minNumbers, 1) : 0) +
        (key !== "minSymbols" && options.symbols ? Math.max(options.minSymbols, 1) : 0);

      const availableMax = Math.max(maxLimit - otherMins, 0);
      const clamped = Math.min(Math.max(num, 0), availableMax);

      setOptions((prev) => ({ ...prev, [key]: clamped }));
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 items-center bg-zinc-900 border border-zinc-800 p-5">
      <div className="flex items-center justify-between w-full">
        <span className="text-white">TAMANHO</span>
        <input
          className="text-white text-center text-xl w-12 h-10 focus-within:border-zinc-600 bg-zinc-800 border border-zinc-700 outline-none"
          type="text"
          pattern="[0-9]*"
          min={minLength}
          max={maxLength}
          value={options.length}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "") {
              setOptions((prev) => ({ ...prev, length: 0 }));
              return;
            }

            const number = Number(val);

            if (!isNaN(number)) {
              if (number > maxLength) {
                setOptions((prev) => ({ ...prev, length: maxLength }));
                return;
              }
              if (number >= 0) {
                setOptions((prev) => ({ ...prev, length: number }));
              }
            }
          }}
        />
        <span className="text-transparent">TAMANHO</span>
      </div>

      <RangeSlider
        value={options.length}
        onChange={(val) => setOptions((prev) => ({ ...prev, length: val }))}
        minLength={minLength}
        maxLength={maxLength}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-2">
        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={options.lowercase}
            label={"a-z"}
            value="lowercase"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!options.lowercase}
              value={options.minLowercase || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, "minLowercase", maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={options.uppercase}
            label={"A-Z"}
            value="uppercase"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!options.uppercase}
              value={options.minUppercase || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, "minUppercase", maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={options.numbers}
            label={"0-9"}
            value="numbers"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!options.numbers}
              value={options.minNumbers || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, "minNumbers", maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <SwitchButton
            checked={options.symbols}
            label={options.standardSymbols ? "!@#$" : "!@#$+"}
            value="symbols"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!options.symbols}
              value={options.minSymbols || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, "minSymbols", maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-around gap-2 pt-3 border-t border-zinc-800">
        <div className="flex flex-col gap-1 items-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">SÍMBOLOS PADRÕES</span>
            <span className="text-xs text-zinc-400">
              {options.standardSymbols
                ? "!@#$%*()_+-="
                : "!@#$%^&*()_+-=[..."}
            </span>
          </div>
          <Switch.Root
            checked={options.standardSymbols}
            disabled={!options.symbols}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, standardSymbols: checked }))
            }
            className="relative h-[25px] w-[42px] cursor-pointer rounded-full bg-zinc-700 outline-none data-[state=checked]:bg-brand disabled:opacity-30 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
          >
            <Switch.Thumb
              className="block size-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
            />
          </Switch.Root>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">REMOVER CARACTERES AMBIGUOS</span>
            <span className="text-xs text-zinc-400">
              il1Lo0IO
            </span>
          </div>
          <Switch.Root
            checked={options.excludeAmbiguous}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, excludeAmbiguous: checked }))
            }
            className="relative h-[25px] w-[42px] cursor-pointer rounded-full bg-zinc-700 outline-none data-[state=checked]:bg-brand disabled:opacity-30 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
          >
            <Switch.Thumb
              className="block size-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
            />
          </Switch.Root>
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 pt-3 border-t border-zinc-800">
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-bold text-white">
            CARACTERES OBRIGATÓRIOS
          </label>
          <input
            type="text"
            placeholder="Ex: @#$_aB1"
            value={options.includeChars}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, includeChars: e.target.value }))
            }
            className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-bold text-white">
            EXCLUIR CARACTERES ESPECÍFICOS
          </label>
          <input
            type="text"
            placeholder="Ex: abc123"
            value={options.excludeChars}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, excludeChars: e.target.value }))
            }
            className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500"
          />
        </div>
      </div>
    </div>
  );
};
