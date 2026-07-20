"use client";

import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

// Page transition: a gentle fade on every navigation. Opacity only, so it never
// breaks the sticky header/tabs (a transform would create a containing block).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
