import type { ReactNode } from "react";

export const IconButton = ({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <div className="flex flex-row gap-[14px] justify-center items-start">
        <div className="flex flex-row justify-center items-center border border-zinc-700 w-[35px] h-[35px] bg-zinc-950">
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-white text-[14px]">{title}</span>
          <span className="text-zinc-600 text-[12px]">{subtitle}</span>
        </div>
      </div>
    </button>
  );
};

// <button className="flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border border-zinc-800">
//   <div className="flex flex-row gap-[14px] justify-center items-start">
//     <div className="flex flex-row justify-center items-center border border-zinc-700 w-[35px] h-[35px] bg-zinc-950">
//       <FileUp
//         width={22}
//         height={22}
//         strokeWidth={1.5}
//         className="text-zinc-400"
//       />
//     </div>
//     <div className="flex flex-col items-start">
//       <span className="text-white text-[14px]">
//         Selecionar arquivo
//       </span>
//       <span className="text-zinc-600 text-[12px]">
//         Carregar cofre existente
//       </span>
//     </div>
//   </div>
// </button>
