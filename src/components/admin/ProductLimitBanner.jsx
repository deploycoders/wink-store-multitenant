"use client";
import React from "react";

/**
 * ProductLimitBanner - Comentado para desactivar funcionalidad de membresías.
 */
const ProductLimitBanner = () => {
  return null;
};

export default ProductLimitBanner;

/*
import React from "react";
import { usePlanLimits } from "@/context/PlanLimitsContext";
import { limitLabel, usagePercent, usageColor } from "@/lib/planLimits";
import { Package, TrendingUp } from "lucide-react";

export default function ProductLimitBanner() {
  const { planCode, planLimits, counts, loading } = usePlanLimits();

  if (loading || !planLimits) return null;

  const percent = usagePercent(counts.products, planLimits.max_products);
  const colors = usageColor(percent);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bar} bg-opacity-10 flex items-center justify-center text-slate-900 dark:text-white`}>
            <Package size={24} className={colors.text} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
              Capacidad del Catálogo
            </h3>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
              {limitLabel(counts.products, planLimits.max_products)}
              <span className="text-[10px] ml-2 text-slate-400 font-bold uppercase tracking-tighter">
                Productos Publicados
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>
              {percent}% del límite utilizado
            </span>
            {percent >= 80 && (
                <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                    <TrendingUp size={12} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Cerca del límite</span>
                </div>
            )}
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.bar} transition-all duration-1000 ease-out`} 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
*/
