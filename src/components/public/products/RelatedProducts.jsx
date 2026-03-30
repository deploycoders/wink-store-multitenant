"use client";
import * as React from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/public/products/ProductCard";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function RelatedProducts({ products }) {
  // 1. Simplificamos el plugin. No necesitamos manejar los eventos manualmente
  // porque el plugin ya trae esas opciones por defecto.
  const plugin = React.useRef(
    Autoplay({
      delay: 2000, // Un poco más de tiempo para que no sea estresante
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  );

  // 2. Validación de seguridad: si no hay productos, no renderizamos el carrusel
  if (!products || products.length === 0) {
    return (
      <section className="py-24 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">
            Selección Exclusiva
          </span>
          <h2 className="text-xl md:text-2xl font-medium text-zinc-500 italic">
            No hay prendas disponibles por el momento
          </h2>
          <div className="w-12 h-px bg-zinc-200 mx-auto mt-6"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            Selección Exclusiva
          </span>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-zinc-950">
            Quizás te guste
          </h2>
          <div className="w-12 h-px bg-zinc-900 mt-4"></div>
        </div>

        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            containScroll: "trimSnaps",
          }}
          className="w-full relative"
          // ELIMINADOS: onMouseEnter, onMouseLeave, etc.
          // El plugin Autoplay ya se encarga de esto internamente.
        >
          <CarouselContent className="-ml-4">
            {products.slice(0, 8).map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {/* Asegúrate de que ProductCard use product.name y no product.title */}
                  <ProductCard product={product} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-end gap-2 mt-8">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 border-zinc-200 rounded-none hover:bg-black hover:text-white transition-all cursor-pointer" />
            <CarouselNext className="static translate-y-0 h-10 w-10 border-zinc-200 rounded-none hover:bg-black hover:text-white transition-all cursor-pointer" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
