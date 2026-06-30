"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  /** Coarser key avoids remounting on sibling route changes (e.g. /home tabs). */
  transitionKey?: string;
}

function getSectionKey(pathname: string): string {
  if (pathname.startsWith("/home")) return "/home";
  return pathname;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const pathname = usePathname();
  const key = transitionKey ?? getSectionKey(pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
