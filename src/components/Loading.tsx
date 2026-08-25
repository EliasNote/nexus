import { motion } from "framer-motion";

export const Loading = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <img src="/loading.webp" className="h-18 w-18 object-contain" alt="" />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-zinc-300">{text}</motion.p>
    </div>
  );
};
