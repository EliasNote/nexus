import type { LucideIcon } from "lucide-react";

export const Button = ({
  iconsSize,
  icon: Icon,
  color,
  label,
  onClick,
  disabled,
  children,
}: {
  iconsSize?: number;
  icon?: LucideIcon;
  color: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex gap-1.25 items-center ${children ? "px-2" : "px-3.5"} py-2 border-2 font-bold ${color} hover:text-white cursor-pointer`}
    >
      {Icon && <Icon size={iconsSize} />}
      {label && <span>{label}</span>}
      {children && <>{children}</>}
    </button>
  );
};
