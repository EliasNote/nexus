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
    className={className ? className : `flex h-full w-12 cursor-pointer items-center justify-center border-l transition-colors hover:bg-zinc-800 hover:text-brand ${errorContent ? "border-red-500 text-red-400" : "border-zinc-800 text-zinc-600 group-focus-within:border-zinc-600"}`}
    >
      {children}
    </button>
  );
};
