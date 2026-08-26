import * as Switch from "@radix-ui/react-switch";
import { RangeSlider } from "./RangeSlider";
import { SwitchButton } from "./SwitchButton";

export const GeneratorOptions = ({
  passlength,
  setPasslength,
  minLength,
  maxLength,
  handleToggle,
  lowercase,
  uppercase,
  numbers,
  symbols,
  minLowercase,
  setMinLowercase,
  minUppercase,
  setMinUppercase,
  minNumbers,
  setMinNumbers,
  minSymbols,
  setMinSymbols,
  standardSymbols,
  setStandardSymbols,
}: {
  passlength: number;
  setPasslength: (value: number) => void;
  minLength: number;
  maxLength: number;
  handleToggle: (value: string) => void;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  minLowercase: number;
  setMinLowercase: (value: number) => void;
  minUppercase: number;
  setMinUppercase: (value: number) => void;
  minNumbers: number;
  setMinNumbers: (value: number) => void;
  minSymbols: number;
  setMinSymbols: (value: number) => void;
  standardSymbols: boolean;
  setStandardSymbols: (value: boolean) => void;
}) => {
  const handleMinChange = (
    val: string,
    setter: (v: number) => void,
    maxLimit: number
  ) => {
    if (val === "") {
      setter(0);
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num > maxLimit) {
        setter(maxLimit);
        return;
      }
      if (num >= 0) setter(num);
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
          value={passlength}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "") {
              setPasslength(0);
              return;
            }

            const number = Number(val);

            if (!isNaN(number)) {
              if (number > maxLength) {
                setPasslength(maxLength);
                return;
              }
              if (number >= 0) setPasslength(number);
            }
          }}
        />
        <span className="text-transparent">TAMANHO</span>
      </div>

      <RangeSlider
        value={passlength}
        onChange={setPasslength}
        minLength={minLength}
        maxLength={maxLength}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-2">
        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={lowercase}
            label={"a-z"}
            value="lowercase"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!lowercase}
              value={minLowercase || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, setMinLowercase, maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={uppercase}
            label={"A-Z"}
            value="uppercase"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!uppercase}
              value={minUppercase || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, setMinUppercase, maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <SwitchButton
            checked={numbers}
            label={"0-9"}
            value="numbers"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!numbers}
              value={minNumbers || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, setMinNumbers, maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <SwitchButton
            checked={symbols}
            label={standardSymbols ? "!@#$" : "!@#$+"}
            value="symbols"
            handleToggle={handleToggle}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-zinc-400 font-medium">MÍN:</span>
            <input
              type="text"
              pattern="[0-9]*"
              disabled={!symbols}
              value={minSymbols || ""}
              placeholder="0"
              onChange={(e) =>
                handleMinChange(e.target.value, setMinSymbols, maxLength)
              }
              className="text-white text-center text-sm w-9 h-7 bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full items-center pt-3 border-t border-zinc-800">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">SÍMBOLOS PADRÕES</span>
          <span className="text-xs text-zinc-400">
            {standardSymbols
              ? "!@#$%*()_+-="
              : "!@#$%^&*()_+-=[..."}
          </span>
        </div>
        <Switch.Root
          checked={standardSymbols}
          disabled={!symbols}
          onCheckedChange={setStandardSymbols}
          className="relative h-[25px] w-[42px] cursor-pointer rounded-full bg-zinc-700 outline-none data-[state=checked]:bg-brand disabled:opacity-30 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
        >
          <Switch.Thumb
            className="block size-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
          />
        </Switch.Root>
      </div>
    </div>
  );
};
