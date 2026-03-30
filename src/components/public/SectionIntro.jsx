"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
  },
};

export default function SectionIntro({
  title,
  description,
  className = "mb-20",
  headingClassName = "text-2xl md:text-3xl lg:text-4xl",
  lineClassName = "w-12",
  descriptionClassName = "max-w-3xl",
  viewport = { once: true, amount: 0.2 },
  animate = false,
}) {
  return (
    <motion.div
      className={`flex flex-col items-center text-center space-y-6 ${className}`}
      initial="hidden"
      variants={containerVariants}
      {...(animate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
    >
      <motion.div
        className="flex flex-col items-center"
        variants={itemVariants}
      >
        <h2
          className={`text-zinc-900 leading-tight font-bold uppercase tracking-widest px-4 ${headingClassName}`}
        >
          {title}
        </h2>
        <div className={`h-px bg-zinc-900 mt-4 ${lineClassName}`}></div>
      </motion.div>

      <motion.p
        className={`text-zinc-500 text-sm md:text-base font-light leading-relaxed px-4 ${descriptionClassName}`}
        variants={itemVariants}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
