export const BlueButton = ({
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
      className={`${className ?? 'px-7 py-2.5'} text-base bg-brand hover:bg-brand/90 active:bg-brand/95 border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
