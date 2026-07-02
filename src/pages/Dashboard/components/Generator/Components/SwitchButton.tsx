import * as Switch from "@radix-ui/react-switch";

export const SwitchButton = ({
  label,
  value,
  handleToggle,
  checked,
}: {
  label: string;
  value: string;
  handleToggle: (value: string) => void;
  checked: boolean;
}) => (
  <div className="flex flex-col items-center justify-center gap-1.5">
    <label
      id="airplane-mode-label"
      htmlFor="airplane-mode"
      className="text-[15px] leading-none text-white font-bold"
    >
      {label}
    </label>
    <Switch.Root
      checked={checked}
      onCheckedChange={() => handleToggle(value)}
      className="relative h-[25px] w-[42px] cursor-pointer rounded-full bg-zinc-700 outline-none focus:shadow-[0_0_0_2px] focus:shadow-none data-[state=checked]:bg-brand [-webkit-tap-highlight-color:transparent]"
      id="airplane-mode"
    >
      <Switch.Thumb
        id="airplane-mode"
        aria-labelledby="airplane-mode-label"
        className="block size-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
      />
    </Switch.Root>
  </div>
);
