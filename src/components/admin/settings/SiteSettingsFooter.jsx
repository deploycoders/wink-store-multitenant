"use client";

import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

export default function SiteSettingsFooter({
  loading,
  uploading,
  status,
  onSave,
}) {
  return (
    <div className="sticky bottom-0 bg-[#FBFBFB]/80 dark:bg-slate-950/80 backdrop-blur-md p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-t-[2.5rem] z-10 -mx-6 -mb-6">
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center sm:text-left">
        Acá puedes guardar los ajustes globales de tu sitio, si ya guardaste las
        configuraciones por seccion, no sobreescribirá los cambios.
      </p>
      <div>
        {status.message && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {status.message}
          </div>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={loading || uploading}
        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 h-14 rounded-2xl hover:bg-slate-700 dark:hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        GUARDAR AJUSTES GLOBALES
      </button>
    </div>
  );
}
