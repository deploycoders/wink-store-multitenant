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
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      opacity: 0.75,
      stagePadding: 10,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "Paso {{current}} de {{total}}",
      onDeselected: () => {
        localStorage.setItem("has_seen_tour_v2", "true");
      },
      steps: [
        {
          popover: {
            title: `¡Bienvenida a ${site_name}!`,
            description: "Hemos preparado este recorrido rápido para que conozcas cómo navegar y comprar en nuestra tienda premium.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "header nav, button[aria-label='Abrir menú']",
          popover: {
            title: "Menú de categorías",
            description: "Desde aquí tienes acceso rápido a las colecciones de la tienda. Explora lo que ofrecemos y encuentra tu estilo.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "button[aria-label='Abrir carrito']",
          popover: {
            title: "Tu Carrito",
            description: "Aquí verás tus productos elegidos y podrás proceder al pago seguro de forma rápida.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: ".fixed.bottom-6.right-6",
          popover: {
            title: "Seguimiento de Pedidos",
            description: "Este es el corazón del servicio al cliente. Púlsalo para rastrear tu orden en tiempo real una vez que hayas comprado.",
            side: "top",
            align: "center"
          }
        },
        {
          element: ".fixed.bottom-24.right-9",
          popover: {
            title: "¿Necesitas Ayuda?",
            description: "Si alguna vez te sientes perdido o quieres repetir este tour, este botón estará siempre aquí para guiarte.",
            side: "top",
            align: "center"
          }
        }
      ]
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
