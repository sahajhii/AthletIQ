import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div whileHover={{ y: -4 }} className={cn("glass-panel rounded-[1.5rem] p-5 shadow-glow", className)}>
      {children}
    </motion.div>
  );
}
