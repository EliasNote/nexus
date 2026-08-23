export const GrayButton = ({
  text,
  onClick,
  className,
  disabled
}: {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => {

  return (
    <button
      className={`${className ?? 'px-7 py-2.5'} text-base bg-zinc-800 hover:bg-zinc-800/80 active:bg-zinc-800/60 border font-bold border-zinc-600 text-white shadow-lg cursor-pointer`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
