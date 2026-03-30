"use client";

import { Search } from "lucide-react";

const TIPOS = ["todos", "venta", "cliente", "producto", "categoria", "usuario", "orden", "ajuste"];
const ACCIONES = ["todas", "crear", "editar", "eliminar", "aceptar", "rechazar", "login"];

export function AuditFilters({ search, setSearch, tipo, setTipo, accion, setAccion }) {
  const selectClass =
    "px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-xs font-bold uppercase tracking-tighter cursor-pointer w-full md:w-auto";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col md:flex-row items-center gap-4">
      {/* Buscador */}
      <div className="relative flex-1 w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por descripción o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-sm transition-all"
        />
      </div>

      {/* Filtro Tipo */}
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
        {TIPOS.map((t) => (
          <option key={t} value={t}>
            {t === "todos" ? "Todos los tipos" : t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      {/* Filtro Acción */}
      <select value={accion} onChange={(e) => setAccion(e.target.value)} className={selectClass}>
        {ACCIONES.map((a) => (
          <option key={a} value={a}>
            {a === "todas" ? "Todas las acciones" : a.charAt(0).toUpperCase() + a.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
