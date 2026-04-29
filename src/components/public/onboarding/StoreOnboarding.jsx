"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronRight,
  X,
  Sparkles,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/context/SiteConfigContext";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function StoreOnboarding() {
  const [hasMounted, setHasMounted] = useState(false);
  const { site_name, tenant_slug } = useSiteConfig();

  useEffect(() => {
    setHasMounted(true);

    const hasSeen = localStorage.getItem("has_seen_tour_v2");
    if (!hasSeen) {
      setTimeout(() => {
        startTour();
      }, 2000);
    }
  }, []);

  const startTour = () => {
    const isDesktop = window.innerWidth >= 1024;

    const steps = [
      // 1. Bienvenida (Sin elemento, centrado en pantalla)
      {
        popover: {
          title: `¡Bienvenida a ${site_name}!`,
          description: isDesktop 
            ? "Descubre la experiencia premium que hemos diseñado para ti. Este breve recorrido te mostrará cómo navegar por nuestro catálogo exclusivo."
            : "Te enseñamos cómo navegar y comprar en nuestra tienda de forma rápida.",
          side: "bottom",
          align: "center"
        }
      },
      // 2. Menú de categorías (Diferente selector para Desktop/Mobile)
      {
        element: isDesktop ? "#desktop-nav" : "button[aria-label='Abrir menú']",
        popover: {
          title: "Colecciones Exclusivas",
          description: isDesktop 
            ? "Navega por nuestras categorías principales directamente desde aquí."
            : "Desde aquí puedes explorar todas las categorías de la tienda.",
          side: "bottom",
          align: isDesktop ? "center" : "start"
        }
      },
      // 3. Carrito
      {
        element: "button[aria-label='Abrir carrito']",
        popover: {
          title: "Tu Carrito",
          description: "Tus productos favoritos se guardarán aquí mientras exploras.",
          side: "bottom",
          align: "end"
        }
      },
      // 4. Seguimiento de Pedidos (Widget flotante)
      {
        element: ".fixed.bottom-6.right-6",
        popover: {
          title: "Tus Compras",
          description: "Rastrea tus pedidos en tiempo real con este botón mágico.",
          side: "top",
          align: "center"
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      opacity: 0.85,
      stagePadding: 10,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Empezar!",
      progressText: "Paso {{current}} de {{total}}",
      onDeselected: () => {
        localStorage.setItem("has_seen_tour_v2", "true");
      },
      steps: steps
    });

    driverObj.drive();
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* Botón de Ayuda Flotante (Lanzador manual) */}
      <div className="fixed bottom-24 right-9 z-40 pointer-events-none">
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={startTour}
          className="pointer-events-auto w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer group"
          title="Ver tutorial"
        >
          <HelpCircle size={16} />
          <span className="absolute right-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold uppercase tracking-widest pointer-events-none">
            ¿Necesitas ayuda?
          </span>
        </motion.button>
      </div>
    </>
  );
}
