"use client";
import { motion } from "framer-motion";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";

export default function Loading() {
  const brand = DEFAULT_SITE_NAME;
  return (
    <>
      {/* Div de respaldo para mantener altura mínima */}
      <div className="min-h-screen" />

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 bg-white flex items-center justify-center z-100"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40"
          >
            {brand}
          </motion.span>
        </div>
      </motion.div>
    </>
  );
}
