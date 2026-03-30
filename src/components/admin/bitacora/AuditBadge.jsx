"use client";

const TIPO_CONFIG = {
  venta: {
    label: "Venta",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  cliente: {
    label: "Cliente",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
  },
  producto: {
    label: "Producto",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
  },
  categoria: {
    label: "Categoría",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
  },
  usuario: {
    label: "Usuario",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
  },
  orden: {
    label: "Orden",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
  },
  ajuste: {
    label: "Ajuste",
    bg: "bg-slate-100 dark:bg-slate-700",
    text: "text-slate-600 dark:text-slate-300",
  },
};

const ACCION_CONFIG = {
  crear: { label: "✦ Crear", text: "text-emerald-600 dark:text-emerald-400" },
  editar: { label: "✎ Editar", text: "text-blue-600 dark:text-blue-400" },
  eliminar: { label: "✕ Eliminar", text: "text-red-600 dark:text-red-400" },
  aceptar: { label: "✔ Aceptar", text: "text-emerald-600 dark:text-emerald-400" },
  rechazar: { label: "✘ Rechazar", text: "text-red-600 dark:text-red-400" },
  login: { label: "→ Login", text: "text-slate-500 dark:text-slate-400" },
};

export function TipoBadge({ tipo }) {
  const cfg = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.ajuste;
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

export function AccionBadge({ accion }) {
  const cfg = ACCION_CONFIG[accion] ?? { label: accion, text: "text-slate-500" };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
