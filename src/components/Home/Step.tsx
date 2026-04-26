import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  step0: boolean;
  hideStep0: boolean;
  handleStep: () => void;
  id: number;
  children?: ReactNode;
  x0: number;
  x1: number;
  x2: number;
};

export function Step({
  step0,
  hideStep0,
  handleStep,
  id,
  children,
  x0,
  x1,
  x2,
}: Props) {
  return (
    <>
      {!hideStep0 && (
        <motion.div
          key={id}
          id={`${id}`}
          className="absolute flex gap-4 items-center justify-center font-normal text-sm"
          initial={{ x: x0 }}
          animate={{
            x: step0 ? x1 : x2,
          }}
          transition={{
            type: "spring",
            duration: 1,
            ease: "easeIn",
          }}
          onAnimationComplete={() => {
            if (!step0) {
              handleStep();
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
