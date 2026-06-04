import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  direction: number;
  children: ReactNode;
};

export function Step({ direction, children }: Props) {
  const variants = {
    initial: (dir: number) => ({
      x: dir === 1 ? 1200 : -1200,
    }),
    animate: { x: 0 },
    exit: (dir: number) => ({
      x: dir === 1 ? -1200 : 1200,
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", duration: 0.3, ease: "easeInOut" }}
      className="absolute flex gap-4 items-center justify-center font-normal text-sm"
    >
      {children}
    </motion.div>
  );
}
