"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { PLATFORM_BRAND_NAME } from "@/lib/siteConfig";

/**
 * Componente Preloader unificado
 *
 * @param {boolean} showBranding - Si se debe mostrar el nombre de la plataforma (Wink Store)
 * @param {string} className - Clases adicionales de Tailwind
 * @param {string} size - Tamaño del spinner (default: 40)
 */
export default function Preloader({
  showBranding = false,
  className = "",
  size = 40,
}) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-500 ${className}`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Spinner animado con diseño de anillo dual */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full border-2 border-slate-100 dark:border-zinc-800"
            style={{ width: size + 20, height: size + 20 }}
          />
          <Loader2
            className="animate-spin text-slate-900 dark:text-white"
            size={size}
            strokeWidth={1.5}
          />
        </div>

        {/* Branding opcional */}
        {showBranding && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              {PLATFORM_BRAND_NAME}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="h-px w-6 bg-slate-200 dark:bg-zinc-800"></span>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-[0.4em]">
                Loading
              </p>
              <span className="h-px w-6 bg-slate-200 dark:bg-zinc-800"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
