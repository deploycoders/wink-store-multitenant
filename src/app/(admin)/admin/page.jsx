"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    ventasHoy: 0,
    ordenesTotales: 0,
    stockBajo: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenant_id: tenantId } = useSiteConfig();

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();
      const buildCustomerFromOrder = (order) => {
        const embedded = order?.customer || order?.cliente || {};
        return {
          full_name:
            embedded?.full_name ||
            order?.customer_name ||
            "Desconocido",
        };
      };

      const attachCustomers = async (orders) => {
        const ids = [
          ...new Set(orders.map((order) => order.customer_id).filter(Boolean)),
        ];
        if (ids.length === 0) {
          return orders.map((order) => ({
            ...order,
            clientes: buildCustomerFromOrder(order),
          }));
        }

        const tables = ["customers"];
        let customerMap = new Map();

        for (const tableName of tables) {
          let query = supabase
            .from(tableName)
            .select("id, full_name")
            .in("id", ids);
          if (tenantId) query = query.eq("tenant_id", tenantId);

          const { data, error } = await query;
          if (!error) {
            customerMap = new Map((data || []).map((row) => [row.id, row]));
            break;
          }
        }

        return orders.map((order) => ({
          ...order,
          clientes:
            customerMap.get(order.customer_id) || buildCustomerFromOrder(order),
        }));
      };

      // 1. Ventas Hoy (estado Completado / paid)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      let todayQuery = supabase
        .from("orders")
        .select("total")
        .eq("estado", "paid")
        .gte("created_at", startOfToday.toISOString());
      if (tenantId) todayQuery = todayQuery.eq("tenant_id", tenantId);
      const { data: hoyOrders } = await todayQuery;

      const ventasHoy =
        hoyOrders?.reduce((acc, o) => acc + Number(o.total || 0), 0) || 0;

      // 2. Órdenes Totales
      let totalOrdersQuery = supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      if (tenantId)
        totalOrdersQuery = totalOrdersQuery.eq("tenant_id", tenantId);
      const { count: ordenesTotales } = await totalOrdersQuery;

      // 3. Stock Bajo (menor o igual a 5)
      let lowStockQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lte("stock", 5);
      if (tenantId) lowStockQuery = lowStockQuery.eq("tenant_id", tenantId);
      const { count: stockBajo } = await lowStockQuery;

      // 4. Últimas Órdenes
      let recentQuery = supabase
        .from("orders")
        .select(
          "id, total, estado, created_at, customer_id, customer_name, customer_id_number, customer_phone",
        )
        .order("created_at", { ascending: false })
        .limit(5);
      if (tenantId) recentQuery = recentQuery.eq("tenant_id", tenantId);
      const { data: recientes } = await recentQuery;

      setMetrics({
        ventasHoy,
        ordenesTotales: ordenesTotales || 0,
        stockBajo: stockBajo || 0,
      });
      setRecentOrders(await attachCustomers(recientes || []));
      setLoading(false);
    }

    fetchDashboardData();
  }, [tenantId]);

  return (
    <div className="space-y-8 md:space-y-12 pb-10 transition-all duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Resumen General
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Actividad comercial de tu tienda para el día de hoy.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 flex-wrap rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm dark:shadow-inner transition-colors">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
            Sistema Sincronizado
          </span>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Ventas Hoy"
          value={
            loading ? (
              <Loader2 className="animate-spin text-slate-300" size={32} />
            ) : (
              `$${metrics.ventasHoy.toFixed(2)}`
            )
          }
          trend={loading ? "..." : "Hoy"}
          isPositive={true}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard
          label="Órdenes Históricas"
          value={
            loading ? (
              <Loader2 className="animate-spin text-slate-300" size={32} />
            ) : (
              metrics.ordenesTotales
            )
          }
          trend={loading ? "..." : "Total"}
          isPositive={true}
          icon={ShoppingCart}
          color="bg-slate-900"
        />
        <StatCard
          label="Stock Bajo"
          value={
            loading ? (
              <Loader2 className="animate-spin text-slate-300" size={32} />
            ) : (
              metrics.stockBajo
            )
          }
          trend={loading ? "..." : "A Revisar"}
          isPositive={metrics.stockBajo === 0}
          icon={Package}
          color={metrics.stockBajo > 0 ? "bg-orange-500" : "bg-slate-300"}
        />
      </div>

      {/* TABLA DE ÓRDENES RECIENTES Y ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Órdenes Recientes
            </h2>
            <a
              href="/admin/orders"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center text-slate-300">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Orden
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-37.5">
                        {order.clientes?.full_name || "Desconocido"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            order.estado === "pending"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                              : order.estado === "paid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {order.estado === "pending" ? "Pendiente" : order.estado === "paid" ? "Completado" : "Cancelado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No hay órdenes registradas
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Accesos Rápidos
          </h2>
          <div className="flex flex-col gap-4">
            <QuickAction
              title="Productos"
              description="Gestionar stock y precios"
              href="/admin/products"
            />
            <QuickAction
              title="Categorías"
              description="Organizar el catálogo"
              href="/admin/categories"
            />
            <QuickAction
              title="Ventas"
              description="Historial de pedidos"
              href="/admin/orders"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, isPositive, icon: Icon, color }) {
  return (
    <div
      className="
      relative overflow-hidden
      bg-white dark:bg-slate-800 p-8 rounded-2xl dark:rounded-3xl
      border border-slate-100 dark:border-slate-700/50
      shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
      hover:-translate-y-2
      group cursor-default
    "
    >
      {/* Luz interna en hover (Sólo Dark Mode) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-500 group-hover:bg-white/10 hidden dark:block" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div
          className={`p-3 rounded-2xl ${color} text-white dark:bg-slate-900 dark:text-white dark:border dark:border-slate-700/50 dark:shadow-inner transition-colors`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <span
          className={`text-[10px] font-black px-3 py-1 rounded-full border ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1 dark:group-hover:text-slate-300 transition-colors">
          {label}
        </p>
        <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
          {value}
        </h3>
      </div>
    </div>
  );
}

function QuickAction({ title, description, href }) {
  return (
    <a
      href={href}
      className="
      flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50
      hover:border-slate-900 dark:hover:border-white hover:-translate-y-1 shadow-sm hover:shadow-xl
      transition-all duration-300 group cursor-pointer
    "
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {title}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {description}
        </span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-slate-700 group-hover:text-white transition-all dark:shadow-inner">
        <ArrowUpRight size={20} />
      </div>
    </a>
  );
}
