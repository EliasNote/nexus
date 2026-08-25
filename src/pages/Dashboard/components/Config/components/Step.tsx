import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { BlueButton } from "@/pages/Home/components/BlueButton";
import { GrayButton } from "@/pages/Home/components/GrayButton";

export const Step = (
  {
    setImportVaultStep,
    onClickGrayButton,
    onClickBlueButton,
    title,
    children,
  }:
    {
      setImportVaultStep: (value: boolean) => void
      onClickGrayButton: () => void
      onClickBlueButton: () => void
      title: string
      children: React.ReactNode
    }
) => {

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setImportVaultStep(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 max-w-md w-full p-6 flex flex-col items-center text-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <AlertTriangle size={24} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h4 className="text-lg font-bold text-white">{title}</h4>
          <p className="text-sm text-zinc-100">
            {children}
          </p>
        </div>

        <div className="flex gap-3 w-full mt-2">
          <GrayButton
            text="Voltar"
            className="flex-1 py-2.5"
            onClick={onClickGrayButton}
          />
          <BlueButton
            text="Continuar"
            className="flex-1"
            onClick={onClickBlueButton}
          />
        </div>
      </motion.div>
    </div>
  );
};
