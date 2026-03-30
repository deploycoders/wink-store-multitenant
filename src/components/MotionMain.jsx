"use client";

import { motion } from "framer-motion";

export default function MotionMain({ children, className }) {
  return (
    <motion.main
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
      className={className}
    >
      {children}
    </motion.main>
  );
}
