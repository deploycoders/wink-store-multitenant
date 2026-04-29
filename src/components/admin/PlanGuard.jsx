"use client";
import React from "react";

/**
 * PlanGuard - Comentado para desactivar funcionalidad de membresías.
 * Ahora actúa como un passthrough (siempre permite ver el contenido).
 */
const PlanGuard = ({ children }) => {
  return <>{children}</>;
};

export default PlanGuard;

/*
import React from "react";
import { Lock, Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { usePlanLimits } from "@/context/PlanLimitsContext";
import { PLAN_BADGES } from "@/lib/planLimits";

export default function PlanGuard({
  children,
  allowed,
  feature = "Esta funcionalidad",
  description = "Actualiza tu plan para desbloquear características avanzadas.",
  requiredPlan = "silver",
  inline = false,
}) {
  const { planCode } = usePlanLimits();

  if (allowed) return children;

  const badge = PLAN_BADGES[requiredPlan] || PLAN_BADGES.silver;

  if (inline) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in duration-300">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
              <Lock size={18} className="text-slate-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">
              {feature} Bloqueado
            </p>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${badge.bg} ${badge.text} border ${badge.border} mb-3`}>
              Requiere {badge.label}
            </span>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none filter blur-[1px]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-100 dark:border-slate-800">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <Lock size={40} className="text-slate-300" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles size={20} />
        </div>
      </div>

      <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-3">
        {feature}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Actual</span>
            <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${PLAN_BADGES[planCode]?.bg} ${PLAN_BADGES[planCode]?.border} ${PLAN_BADGES[planCode]?.text}`}>
                {PLAN_BADGES[planCode]?.label || "Bronze"}
            </span>
        </div>

        <div className="hidden sm:block text-slate-200">
            <ChevronRight size={24} />
        </div>

        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Requerido</span>
            <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${badge.bg} ${badge.border} ${badge.text}`}>
                {badge.label}
            </span>
        </div>
      </div>

      <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 max-w-lg flex items-start gap-3 text-left">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>¿Por qué veo esto?</strong> Hemos implementado niveles de membresía para asegurar la escalabilidad de la plataforma. Los planes superiores ofrecen más recursos y herramientas avanzadas.
        </p>
      </div>
    </div>
  );
}
*/
