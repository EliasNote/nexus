import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";
import { Check, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";

export const Config = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number[]>([]);

  const toggleOption = (id: number) => {
    if (selectedOptionId.includes(id)) {
      setSelectedOptionId(selectedOptionId.filter((optionId) => optionId !== id));
    } else {
      setSelectedOptionId([...selectedOptionId, id]);
    }
  };

  return (
    <section className="flex justify-center w-full p-7 text-white">
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
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {AUTO_SAVE_INTERVAL_OPTIONS.length > 0 ? (
                  AUTO_SAVE_INTERVAL_OPTIONS.map((f) => (
                    <span
                      key={f.id}
                      className="flex items-center gap-1 bg-zinc-800 text-white text-[12px] px-2 py-0.5 whitespace-nowrap border border-zinc-700"
                    >
                      {f.name}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 text-sm">
                    Nenhum diretório selecionado
                  </span>
                )}
              </div>
              <ChevronDown
                size={18}
                className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="absolute top-[50px] left-0 w-full bg-zinc-900 border border-zinc-700 z-50 shadow-2xl max-h-[200px] overflow-y-auto">
                {AUTO_SAVE_INTERVAL_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 transition-colors"
                  >
                    <span>{option.name}</span>
                    {selectedOptionId.includes(option.id) && (
                      <Check size={16} className="text-brand" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
