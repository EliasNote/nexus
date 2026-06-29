import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { CrendetialTypes } from "@/utils/constants";

export const AddButton = ({
  handleStartCreate,
}: {
  handleStartCreate: (type: "login" | "card" | "note") => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-1 w-[168px] bg-zinc-900 border border-zinc-800 shadow-2xl py-2 flex flex-col overflow-hidden"
          >
            {Object.values(CrendetialTypes).map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  handleStartCreate(item.type);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
              >
                <item.icon size={18} className="text-brand" />
                <span className="text-[14px] font-bold tracking-wider">
                  {item.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[168px] w-[168px] h-[56px]">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial="initial"
          whileHover="hover"
          className={`flex justify-center items-center cursor-pointer gap-[5px] w-full h-full pr-1.5 transition-colors ${
            isOpen ? "bg-brand/80" : "bg-brand"
          } text-[18px] text-white`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            variants={{
              initial: { rotate: 0 },
              hover: { rotate: isOpen ? 45 : 180 },
            }}
          >
            <Plus size={32} />
          </motion.div>
          ADICIONAR
        </motion.button>
      </div>
    </div>
  );
};
