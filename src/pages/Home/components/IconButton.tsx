import type { ReactNode } from "react";
import { useState } from "react";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { Check } from "lucide-react";

export const IconButton = ({
  id,
  icon,
  title,
  subtitle,
  synced,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  synced: boolean;
}) => {
  const { loginWithPromise, download } = useGoogleDrive();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (id === "google") {
      setIsLoading(true);
      try {
        const accessToken = await loginWithPromise();

        const vault = await download(accessToken);
        console.log("Vault baixado:", vault);
      } catch (error) {
        console.error("Erro ao processar Google Drive:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      onClick={() => handleClick()}
      disabled={isLoading}
      className="flex p-[14px] justify-start items-center w-full h-[63px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
    >
      <div className="flex flex-row gap-[14px] justify-center items-center">
        <div className="flex flex-row justify-center items-center border border-zinc-700 w-[35px] h-[35px] bg-zinc-950">
          {synced ? <Check className="text-green-400" /> : icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-white text-[14px] font-bold">{title}</span>
          <span className="text-zinc-600 text-[12px]">{subtitle}</span>
        </div>
      </div>
    </button>
  );
};
