"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipboardList, RefreshCw } from "lucide-react";
import { AuditFilters } from "@/components/admin/bitacora/AuditFilters";
import { AuditTable } from "@/components/admin/bitacora/AuditTable";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function HistoryPage() {
  const supabase = createClient();
  const { tenant_id: tenantId } = useSiteConfig();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [accion, setAccion] = useState("todas");

  /* ── Carga inicial ── */
  const fetchEntries = async () => {
    setLoading(true);
    setLoadError("");

    if (!tenantId) {
      setEntries([]);
      setLoadError("No se pudo resolver tenant_id para cargar la bitácora.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bitacora")
      .select("*")
      .contains("meta", { tenant_id: tenantId })
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error) {
      setEntries(data ?? []);
    } else {
      setEntries([]);
      setLoadError(error.message || "No se pudo cargar la bitácora.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();

    /* ── Realtime: escuchar INSERT en bitácora ── */
    const channel = supabase
      .channel("bitacora-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bitacora" },
        (payload) => {
          setEntries((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  /* ── Filtros en cliente ── */
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchTipo = tipo === "todos" || e.tipo === tipo;
      const matchAccion = accion === "todas" || e.accion === accion;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.descripcion?.toLowerCase().includes(q) ||
        e.usuario_nombre?.toLowerCase().includes(q);
      return matchTipo && matchAccion && matchSearch;
    });
  }, [entries, search, tipo, accion]);

  /* ── Stats rápidas ── */
  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyEntries = entries.filter((e) => new Date(e.created_at) >= hoy);
    return {
      total: entries.length,
      hoy: hoyEntries.length,
      ventas: entries.filter((e) => e.tipo === "venta").length,
      usuarios: entries.filter((e) => e.tipo === "usuario").length,
    };
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Bitácora
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Registro completo de todas las acciones del sistema.
          </p>
        </div>
        <button
          onClick={fetchEntries}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </header>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total registros", value: stats.total, icon: "📋" },
          { label: "Hoy", value: stats.hoy, icon: "📅" },
          { label: "Ventas registradas", value: stats.ventas, icon: "💳" },
          { label: "Eventos de usuario", value: stats.usuarios, icon: "👤" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5 shadow-sm"
          >
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      {loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
          {loadError}
        </div>
      ) : null}

      <AuditFilters
        search={search}
        setSearch={setSearch}
        tipo={tipo}
        setTipo={setTipo}
        accion={accion}
        setAccion={setAccion}
      />

      {/* Tabla */}
      <AuditTable entries={filtered} loading={loading} />
    </div>
  );
}
