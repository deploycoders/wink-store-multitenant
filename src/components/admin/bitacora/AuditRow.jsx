"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { TipoBadge, AccionBadge } from "./AuditBadge";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function AuditRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const hasMeta = entry.meta && Object.keys(entry.meta).length > 0;

  return (
    <>
      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
        {/* Fecha */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {formatDate(entry.created_at)}
          </span>
        </td>

        {/* Tipo */}
        <td className="px-6 py-4">
          <TipoBadge tipo={entry.tipo} />
        </td>

        {/* Acción */}
        <td className="px-6 py-4">
          <AccionBadge accion={entry.accion} />
        </td>

        {/* Descripción */}
        <td className="px-6 py-4 max-w-xs">
          <p className="text-sm text-slate-700 dark:text-slate-300 truncate" title={entry.descripcion}>
            {entry.descripcion || <span className="text-slate-400 italic">Sin descripción</span>}
          </p>
        </td>

        {/* Usuario */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <User size={12} />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
              {entry.usuario_nombre || "Sistema"}
            </span>
          </div>
        </td>

        {/* Expandir meta */}
        <td className="px-6 py-4 text-right">
          {hasMeta && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
              title="Ver detalles"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </td>
      </tr>

      {/* Fila expandible con metadata */}
      {expanded && hasMeta && (
        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
          <td colSpan={6} className="px-10 py-4">
            <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl p-4 overflow-x-auto font-mono border border-slate-200 dark:border-slate-700/50">
              {JSON.stringify(entry.meta, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
