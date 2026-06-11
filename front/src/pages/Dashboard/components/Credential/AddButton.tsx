import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export const AddButton = () => {
  return (
    <motion.button
      initial="initial"
      whileHover="hover"
      className="flex h-fit w-fit cursor-pointer gap-[5px] py-[12px] px-[20px] pl-[14px] bg-brand items-center justify-center text-[18px] text-white"
    >
      <motion.div
        variants={{
          initial: { rotate: 0 },
          hover: { rotate: 180 },
        }}
      >
        <Plus size={32} />
      </motion.div>
      ADICIONAR
    </motion.button>
  );
};
