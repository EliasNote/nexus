import * as Slider from "@radix-ui/react-slider";

export const RangeSlider = ({
  value,
  onChange,
  minLength,
  maxLength,
}: {
  value: number;
  onChange: (value: number) => void;
  minLength: number;
  maxLength: number;
}) => {
  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={[value]}
      onValueChange={(val) => onChange(val[0])}
      min={minLength}
      max={maxLength}
      step={1}
    >
      <Slider.Track className="bg-gray-700 relative grow rounded-full h-1.5">
        <Slider.Range className="absolute bg-brand rounded-full h-full" />
      </Slider.Track>

      <Slider.Thumb
        className="block w-4 h-4 bg-white rounded-full hover:scale-125 transition-all cursor-pointer outline-none"
        aria-label="Comprimento da senha"
      />
    </Slider.Root>
  );
};
