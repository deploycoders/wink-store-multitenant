"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Minimize2,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useOrderTrackingStore } from "@/lib/useOrderTrackingStore";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";

export default function TrackingFloatingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { tenant_slug } = useSiteConfig();
  const { trackings, stopTracking } = useOrderTrackingStore();

  const tracking = tenant_slug ? trackings[tenant_slug] : null;

  if (!tracking) return null;

  const { status, orderCode } = tracking;
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";

  // Mapeo de estados a UI
  const statusConfig = {
    pending: {
      label: "Validando Pago",
      icon: <Loader2 className="animate-spin" size={18} />,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
    paid: {
      label: "¡Pago Aceptado!",
      icon: <CheckCircle2 className="text-emerald-500" size={18} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    cancelled: {
      label: "Pago Rechazado",
      icon: <AlertCircle className="text-rose-500" size={18} />,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
    },
    default: {
      label: status || "Procesando",
      icon: <Package size={18} />,
      color: "text-zinc-500",
      bgColor: "bg-zinc-50",
      borderColor: "border-zinc-100",
    },
  };

  const config = statusConfig[status] || statusConfig.default;

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("¿Deseas cerrar el seguimiento de este pedido?")) {
      stopTracking(tenant_slug);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "pointer-events-auto bg-white dark:bg-slate-900 border shadow-2xl rounded-3xl overflow-hidden transition-all duration-300",
              isExpanded ? "w-72" : "w-64",
            )}
            style={{ borderColor: "var(--honey-light)" }}
          >
            {/* Cabecera del Widget */}
            <div className="p-4 flex items-center justify-between border-b border-honey-light">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-xl", config.bgColor)}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-honey-dark opacity-60">
                    Orden #{orderCode}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-tight",
                      config.color,
                    )}
                  >
                    {config.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg text-zinc-400 transition-colors cursor-pointer"
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-zinc-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="p-3 bg-zinc-50/50 dark:bg-slate-800/50 flex flex-col gap-2">
              <Link
                href={`${baseUrl}/checkout`}
                className="flex items-center justify-between w-full bg-ink text-paper px-4 h-11 rounded-2xl font-bold uppercase text-[9px] tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-sm"
              >
                <span>Ver Detalles</span>
                <ExternalLink size={12} />
              </Link>

              {status === "paid" && (
                <button
                  onClick={() => stopTracking(tenant_slug)}
                  className="w-full bg-emerald-500 text-white h-11 rounded-2xl font-bold uppercase text-[9px] tracking-widest hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  Aceptar y Finalizar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja Flotante (cuando está minimizado o solo como activador) */}
      <motion.button
        layout
        onClick={() => setIsMinimized(false)}
        className={cn(
          "pointer-events-auto mt-3 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer relative",
          isMinimized
            ? "bg-ink text-paper"
            : "bg-white text-ink border border-honey-light scale-0",
        )}
      >
        <Package size={24} />
        {isMinimized && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
