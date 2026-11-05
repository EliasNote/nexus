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
      className={`home-secondary-action ${className ?? 'px-7 py-2.5'} text-base bg-surface-raised hover:bg-surface-raised/80 active:bg-surface-raised/60 border font-bold border-line-focus text-primary shadow-lg cursor-pointer`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
