"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  MessageCircle,
  ShoppingBag,
  Search,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatWhatsappContactNumber,
} from "@/lib/siteConfig";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { tenant_id: tenantId } = useSiteConfig();
  const supabase = createClient();

  const getErrorMessage = (error) =>
    error?.message || error?.details || "Error desconocido";
  const toOrderCode = (id) => String(id || "").slice(-6).toUpperCase();

  const buildCustomerFromOrder = (order, index = 0) => {
    const embedded = order?.customer || order?.cliente || {};
    const nombre =
      embedded?.nombre_completo ||
      order?.cliente_nombre ||
      order?.nombre_cliente ||
      order?.customer_name ||
      "Cliente sin nombre";
    const telefono = embedded?.telefono || order?.telefono || "";
    const cedula = embedded?.cedula || order?.cedula || "";
    const email = embedded?.email || order?.email || "";
    const fallbackKey = `${telefono || "sin-telefono"}-${cedula || "sin-cedula"}-${email || "sin-email"}-${index}`;

    return {
      id: order?.cliente_id || fallbackKey,
      nombre_completo: nombre,
      telefono,
      cedula,
      email,
    };
  };

  const loadCustomersTable = async () => {
    const tables = ["clientes"];
    let lastError = null;

    for (const tableName of tables) {
      let query = supabase
        .from(tableName)
        .select("id, nombre_completo, cedula, telefono, email");

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query.order("nombre_completo");
      if (!error) return data || [];

      lastError = error;

      if (
        tenantId &&
        typeof error.message === "string" &&
        error.message.includes("tenant_id")
      ) {
        const retry = await supabase
          .from(tableName)
          .select("id, nombre_completo, cedula, telefono, email")
          .order("nombre_completo");
        if (!retry.error) return retry.data || [];
        lastError = retry.error;
      }
    }

    if (lastError) {
      console.warn(
        "No se pudo cargar la tabla de clientes. Se usará fallback por órdenes:",
        getErrorMessage(lastError),
      );
    }

    return [];
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      if (!tenantId) {
        setCustomers([]);
        return;
      }

      let ordersQuery = supabase
        .from("orders")
        .select("id, total, estado, created_at, tenant_id, cliente_nombre");
      ordersQuery = ordersQuery.eq("tenant_id", tenantId);

      const { data: ordersData, error: ordersError } = await ordersQuery.order(
        "created_at",
        {
          ascending: false,
        },
      );
      if (ordersError) throw ordersError;

      const orders = ordersData || [];
      const customersFromTable = await loadCustomersTable();

      if (customersFromTable.length > 0) {
        const normalize = (v) =>
          String(v || "")
            .trim()
            .toLowerCase();

        const mapped = customersFromTable.map((customer) => ({
          ...customer,
          orders: orders.filter(
            (order) =>
              order.cliente_id === customer.id ||
              normalize(order.cliente_nombre) ===
                normalize(customer.nombre_completo),
          ),
        }));
        setCustomers(mapped);
      } else {
        const grouped = new Map();
        orders.forEach((order, index) => {
          const customer = buildCustomerFromOrder(order, index);
          if (!grouped.has(customer.id)) {
            grouped.set(customer.id, { ...customer, orders: [] });
          }
          grouped.get(customer.id).orders.push(order);
        });
        setCustomers(Array.from(grouped.values()));
      }

    } catch (error) {
      console.error("Error cargando clientes:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tenantId]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula?.includes(searchTerm),
  );
  const buildWhatsappHref = (phone) => {
    const normalized = formatWhatsappContactNumber(phone, "58");
    return normalized ? `https://wa.me/${normalized}` : "#";
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          Clientes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Base de datos de compradores registrados en la plataforma.
        </p>
      </header>

      {/* Filtros Estándar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o identificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Tabla Estándar con scroll responsive */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Cliente
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Identificación
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Compras
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                >
                  <Loader2
                    className="animate-spin inline mr-2 text-slate-300 dark:text-slate-600"
                    size={20}
                  />
                  Sincronizando clientes...
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-50 dark:border-slate-700/50">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-200 text-sm capitalize">
                          {customer.nombre_completo?.toLowerCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium lowercase">
                          {customer.email || "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono tracking-tighter">
                    {customer.cedula}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg w-fit">
                      <ShoppingBag
                        size={12}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {customer.orders?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 text-slate-400 dark:text-slate-500">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 hover:text-slate-900 cursor-pointer dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        title="Ver detalles del cliente"
                      >
                        <Eye size={18} />
                      </button>
                      <a
                        href={buildWhatsappHref(customer.telefono)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium"
                >
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles del Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 min-h-screen z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 p-8 relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-50 dark:border-slate-700/50">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                  {selectedCustomer.nombre_completo}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-tight">
                  CI/RIF: {selectedCustomer.cedula}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Datos de Contacto
                </h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Teléfono:
                    </span>
                    {selectedCustomer.telefono}
                    <a
                      href={buildWhatsappHref(selectedCustomer.telefono)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:underline text-[10px] uppercase font-bold ml-2"
                    >
                      Chat
                    </a>
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Email:
                    </span>{" "}
                    {selectedCustomer.email || "No registrado"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Resumen Comercial
                </h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Total Pedidos:
                    </span>{" "}
                    {selectedCustomer.orders?.length || 0}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Total Gastado:
                    </span>
                    <span className="ml-2 font-black text-emerald-600 dark:text-emerald-400">
                      $
                      {selectedCustomer.orders
                        ?.filter((o) => o.estado === "Completado")
                        .reduce((sum, o) => sum + Number(o.total || 0), 0)
                        .toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Historial de Compras
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                {selectedCustomer.orders &&
                selectedCustomer.orders.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100/50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Orden
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Artículos
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Total
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {selectedCustomer.orders
                        .sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at),
                        )
                        .map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                              #{toOrderCode(order.id)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-[10px] italic">
                              No disponible en este esquema
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              ${Number(order.total).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                  order.estado === "Pendiente"
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                    : order.estado === "Completado"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                }`}
                              >
                                {order.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-xs text-slate-500 italic text-center">
                    Este cliente no ha realizado compras aún.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
