"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// Gentle fade + rise as the element scrolls into view. Runs once, stays subtle.
export function FadeIn({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      // Primary content must not depend on client-side animation to become visible.
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
