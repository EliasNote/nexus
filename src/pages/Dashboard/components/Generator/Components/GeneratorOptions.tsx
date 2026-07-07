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
}) => {
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
      <div className="flex justify-around w-full">
        <SwitchButton
          checked={lowercase}
          label={"a-z"}
          value="lowercase"
          handleToggle={handleToggle}
        />
        <SwitchButton
          checked={uppercase}
          label={"A-Z"}
          value="uppercase"
          handleToggle={handleToggle}
        />
        <SwitchButton
          checked={numbers}
          label={"0-9"}
          value="numbers"
          handleToggle={handleToggle}
        />
        <SwitchButton
          checked={symbols}
          label={"!@#$"}
          value="symbols"
          handleToggle={handleToggle}
        />
      </div>
    </div>
  );
};
