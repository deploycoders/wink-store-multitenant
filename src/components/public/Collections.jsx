"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import AdaptiveImage from "@/components/ui/AdaptiveImage";

export default function CollectionsSlider() {
  const { hero_slides, loading, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  );

  // Variantes para la animación de entrada
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) return null;

  // Si no hay slides, no mostramos nada o un placeholder
  if (!hero_slides || hero_slides.length === 0) return null;

  const isSingleSlide = hero_slides.length === 1;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="my-8 px-4" // Añadido un poco de padding lateral al contenedor padre
    >
      <Carousel
        plugins={isSingleSlide ? [] : [plugin.current]}
        opts={{ align: "start", loop: !isSingleSlide }}
        className="w-full max-w-7xl mx-auto overflow-hidden rounded-[3rem] border border-zinc-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      >
        <CarouselContent className="ml-0">
          {hero_slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              {/* CAMBIO: Usamos lg:flex-row para que en tablets siga siendo vertical y no se rompa */}
              {/* Aumentamos h-auto a lg:h-[500px] para dar más presencia */}
              <div className="flex flex-col lg:flex-row items-stretch h-auto lg:h-[600px]">
                {/* IMAGEN */}
                <div className="w-full lg:w-1/2 relative h-72 lg:h-full bg-zinc-50 dark:bg-slate-800 overflow-hidden shrink-0">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full relative"
                  >
                    <AdaptiveImage
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </div>

                {/* TEXTO: Ajustamos paddings y tamaños */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-500">
                  <motion.span
                    variants={itemVariants}
                    className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 inline-block"
                  >
                    {slide.subtitle}
                  </motion.span>

                  <motion.h2
                    variants={itemVariants}
                    className="text-2xl md:text-3xl lg:text-4xl font-black leading-[1.1] text-black dark:text-white uppercase tracking-tighter mb-4 max-w-full lg:max-w-md"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    variants={itemVariants}
                    className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base mb-6 lg:mb-8 max-w-md lg:max-w-sm leading-relaxed font-light"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-between gap-4 mt-auto"
                  >
                    <Button
                      asChild
                      className="group px-8 lg:px-10 h-12 text-[10px] font-bold uppercase tracking-[0.2em] bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100 active:scale-[0.97] cursor-pointer transition-all duration-300 shadow-sm shrink-0 rounded-xl"
                    >
                      <Link
                        href={`${baseUrl}/products`}
                        prefetch={false}
                        className="flex items-center"
                      >
                        Comprar Ahora
                        <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>

                    {/* FLECHAS: Solo si hay más de 1 slide */}
                    {!isSingleSlide && (
                      <div className="hidden sm:flex gap-2">
                        <CarouselPrevious className="static translate-y-0 h-10 w-10 border-zinc-200 dark:border-slate-700 shadow-none hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors rounded-xl cursor-pointer" />
                        <CarouselNext className="static translate-y-0 h-10 w-10 border-zinc-200 dark:border-slate-700 shadow-none hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors rounded-xl cursor-pointer" />
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </motion.section>
  );
}
