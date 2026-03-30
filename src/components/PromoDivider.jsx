// src/components/PromoDivider.js
"use client";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";

export default function PromoDivider() {
  const containerRef = useRef(null);
  const { site_name, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Usamos Spring para que el movimiento sea más fluido y menos "rígido"
  const smoothYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // 1. Expansión del contenedor (más sutil)
  const width = useTransform(smoothYProgress, [0, 0.4], ["94%", "100%"]);

  // 2. Parallax de la imagen: Escala + Desplazamiento vertical leve
  const imageScale = useTransform(smoothYProgress, [0, 1], [1.15, 1]);
  const imageY = useTransform(smoothYProgress, [0, 1], ["-5%", "5%"]);

  // 3. Texto: Movimiento reducido para que no choque con los bordes
  const textY = useTransform(smoothYProgress, [0, 1], [30, -30]);

  return (
    <section
      ref={containerRef}
      className="w-full my-24 md:my-40 flex flex-col items-center"
    >
      <motion.div
        style={{ width }}
        className="relative rounded-xl h-137.5 md:h-150 overflow-hidden bg-zinc-950 shadow-2xl mx-auto"
      >
        {/* CAPA DE TEXTO: Centrada en móvil, lateral en desktop */}
        <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-2 items-center">
            <motion.div
              style={{ y: textY }}
              className="bg-black/60 md:bg-black/40 backdrop-blur-md p-6 md:p-10 border border-white/10 rounded-lg max-w-85"
            >
              <h3 className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
                {brand} / Archive 2026
              </h3>

              <h2 className="text-3xl md:text-5xl font-light text-white uppercase leading-tight tracking-tighter mb-6">
                The New <br />
                <span className="font-serif italic font-normal text-zinc-300">
                  Standard
                </span>
              </h2>

              <p className="text-zinc-400 text-[10px] md:text-xs leading-relaxed mb-8 uppercase tracking-[0.15em] opacity-90">
                Piezas diseñadas para resistir el paso del tiempo y las
                tendencias globales.
              </p>

              <Button
                asChild
                className="group relative bg-white text-black rounded-none px-8 h-12 text-[9px] font-bold uppercase tracking-[0.2em] overflow-hidden"
              >
                <Link href={`${baseUrl}/products`}>
                  <span className="relative z-10">Explorar Selección</span>
                  <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>

            {/* Columna derecha vacía en desktop para dejar ver la imagen */}
            <div className="hidden md:block" />
          </div>
        </div>

        {/* CAPA DE IMAGEN: El verdadero Parallax de fondo */}
        <motion.div
          style={{ scale: imageScale, y: imageY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/30 z-10" />{" "}
          {/* Oscurecedor extra */}
          <Image
            src="/banner-image2.jpg"
            alt={`${brand} Collection`}
            fill
            className="object-cover object-center brightness-[0.7]"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Footer del Banner */}
      <div className="max-w-7xl w-full px-8 mt-6 flex justify-between items-center text-zinc-500">
        <div className="h-px flex-1 bg-zinc-800 mr-8 hidden md:block" />
        <p className="text-[8px] md:text-[9px] font-medium uppercase tracking-[0.5em] whitespace-nowrap">
          Minimal Aesthetics — Edition 001
        </p>
      </div>
    </section>
  );
}
