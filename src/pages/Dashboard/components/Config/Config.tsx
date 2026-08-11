import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";
import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";
import { Check, ChevronDown, Save, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "../Credential/components/Header/components/Button";
import type { VaultSummarizedData } from "@/types/vault";

export const Config = () => {
  const { summaryVault, setSummaryVault, vault, setVault, setIsPendingSync } = useCloudStore.getState();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number>(
    AUTO_SAVE_INTERVAL_OPTIONS.findIndex((x) => x.value == summaryVault?.autoSaveInterval)
  );

  const toggleOption = (id: number) => setSelectedOptionId(id);
  const onSave = async () => {
    console.log("AUTO SAVE DO VAULT: ", vault?.autoSaveInterval)
    setIsSaving(true);
    console.log("AUTO SAVE INTERVALO: ", summaryVault?.autoSaveInterval)
    const selectedOption = AUTO_SAVE_INTERVAL_OPTIONS[selectedOptionId];
    const updatedSummaryVault: VaultSummarizedData = { ...summaryVault!, autoSaveInterval: selectedOption.value };
    setSummaryVault(updatedSummaryVault);
    setVault(await cryptoService.updateVaultFromSummary(vault!, updatedSummaryVault))
    console.log("INTERVALO DO VAULT: ", vault?.autoSaveInterval)
    console.log("AUTO SAVE INTERVALO: ", updatedSummaryVault.autoSaveInterval)
    setIsSaving(false);
    setIsPendingSync(true);
  };

  return (
    <section className="flex flex-col items-center w-full p-7 text-white">
      <div className="flex items-center flex-col max-w-[700px] w-full gap-10">
        <div className="flex gap-1 items-center justify-center mb-[-20px]">
          <Settings size={32} className="text-brand" />
          <h2 className="text-[24px] font-bold">
            CONFIGURAÇÕES
          </h2>
        </div>
        <div className="flex flex-col gap-5 w-full">
          <div className="relative">
            <h3 className="font-bold">SALVAMENTO AUTOMÁTICO</h3>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center justify-between bg-zinc-900 border ${isOpen ? "border-zinc-600" : "border-zinc-800"} h-[45px] w-full px-3 cursor-pointer transition-colors`}
            >
              <span>{AUTO_SAVE_INTERVAL_OPTIONS[selectedOptionId]?.title}</span>
              <ChevronDown
                size={18}
                className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="absolute top-[70px] left-0 w-full bg-zinc-900 border border-zinc-700 z-50 shadow-2xl max-h-[200px] overflow-y-auto">
                {AUTO_SAVE_INTERVAL_OPTIONS.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      toggleOption(index)
                      setIsOpen(false);

                    }}
                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 transition-colors"
                  >
                    <span>{option.title}</span>
                    {selectedOptionId === option.value && (
                      <Check size={16} className="text-brand" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {isSaving ?
          <Button
            iconsSize={18}
            icon={Save}
            disabled={true}
            color="border-brand text-brand hover:bg-brand"
            label={"SALVANDO..."}
          />
          :
          <Button
            iconsSize={18}
            icon={Save}
            onClick={onSave}
            color="border-brand text-brand hover:bg-brand"
            label={"SALVAR"}
          />
        }
      </div>
    </section>
  );
};
