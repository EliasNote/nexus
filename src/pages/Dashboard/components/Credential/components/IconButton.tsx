export const IconButton = ({
  onClick,
  errorContent,
  children,
  className
}: {
  onClick: () => void;
  errorContent?: string | null;
  children: React.ReactNode;
  className?: string;
}) => {

  return (
  <button
    type="button"
    onClick={onClick}
    className={className ? className : `flex h-full w-12 cursor-pointer items-center justify-center border-l transition-colors hover:bg-surface-raised hover:text-brand ${errorContent ? "border-red-500 text-danger" : "border-line text-faint group-focus-within:border-line-focus"}`}
    >
      {children}
    </button>
  );
};
