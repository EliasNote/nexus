import { useCloudStore } from "@/hooks/useCloudStore";
import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";
import { Check, ChevronDown, Save, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "../Credential/components/Header/components/Button";

export const Config = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number[]>([]);
  const { summaryVault } = useCloudStore.getState();

  const toggleOption = (id: number) => {
    if (selectedOptionId.includes(id)) {
      setSelectedOptionId(selectedOptionId.filter((optionId) => optionId !== id));
    } else {
      setSelectedOptionId([...selectedOptionId, id]);
    }
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
              <span>{AUTO_SAVE_INTERVAL_OPTIONS.find((x) => x.value == summaryVault?.autoSaveInterval)?.title}</span>
              <ChevronDown
                size={18}
                className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="absolute top-[50px] left-0 w-full bg-zinc-900 border border-zinc-700 z-50 shadow-2xl max-h-[200px] overflow-y-auto">
                {AUTO_SAVE_INTERVAL_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 transition-colors"
                  >
                    <span>{option.title}</span>
                    {selectedOptionId.includes(option.value) && (
                      <Check size={16} className="text-brand" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button
          iconsSize={18}
          icon={Save}
          color="border-brand text-brand hover:bg-brand"
          label={"SALVAR"}
        />
      </div>

    </section>
  );
};
