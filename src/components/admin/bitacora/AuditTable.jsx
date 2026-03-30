"use client";

import { Loader2 } from "lucide-react";
import { AuditRow } from "./AuditRow";

const COLUMNS = ["Fecha y Hora", "Tipo", "Acción", "Descripción", "Usuario", ""];

export function AuditTable({ entries, loading }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-14 text-center text-slate-400 italic">
                <Loader2 className="animate-spin inline mr-2" size={20} />
                Cargando bitácora...
              </td>
            </tr>
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-14 text-center text-slate-400 font-medium">
                No hay registros que coincidan.
              </td>
            </tr>
          ) : (
            entries.map((entry) => <AuditRow key={entry.id} entry={entry} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
