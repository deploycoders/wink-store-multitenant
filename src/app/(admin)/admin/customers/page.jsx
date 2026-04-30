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
import { formatWhatsappContactNumber } from "@/lib/siteConfig";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { convertPrice } from "@/services/exchangeRates";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const { tenant_id: tenantId, exchange_rates } = useSiteConfig();
  const supabase = createClient();

  const getErrorMessage = (error) =>
    error?.message || error?.details || "Error desconocido";
  const toOrderCode = (order) => {
    if (order?.order_number) return String(order.order_number).padStart(5, "0");
    return String(order?.id || "")
      .slice(-6)
      .toUpperCase();
  };

  const buildCustomerFromOrder = (order, index = 0) => {
    const embedded = order?.customer || order?.cliente || {};
    const nombre =
      embedded?.full_name || order?.customer_name || "Cliente sin nombre";
    const telefono = embedded?.phone || order?.customer_phone || "";
    const cedula = embedded?.id_number || order?.customer_id_number || "";
    const email = embedded?.email || order?.customer_email || "";
    const fallbackKey = `${telefono || "sin-telefono"}-${cedula || "sin-cedula"}-${email || "sin-email"}-${index}`;

    return {
      id: order?.customer_id || fallbackKey,
      nombre_completo: nombre,
      telefono,
      cedula,
      email,
    };
  };

  const loadCustomersTable = async () => {
    const tables = ["customers"];
    let lastError = null;

    for (const tableName of tables) {
      let query = supabase
        .from(tableName)
        .select("id, full_name, id_number, phone, email");

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query.order("full_name");
      if (!error)
        return (data || []).map((row) => ({
          ...row,
          nombre_completo: row.full_name,
          cedula: row.id_number,
          telefono: row.phone,
        }));

      lastError = error;

      if (
        tenantId &&
        typeof error.message === "string" &&
        error.message.includes("tenant_id")
      ) {
        const retry = await supabase
          .from(tableName)
          .select("id, full_name, id_number, phone, email")
          .order("full_name");
        if (!retry.error)
          return (retry.data || []).map((row) => ({
            ...row,
            nombre_completo: row.full_name,
            cedula: row.id_number,
            telefono: row.phone,
          }));
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
        .select(
          "id, total, estado, created_at, tenant_id, customer_name, customer_id, customer_id_number, customer_phone, customer_email, items, referencia_pago, metodo_pago, notas, order_number",
        );
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
              order.customer_id === customer.id ||
              normalize(order.customer_name) ===
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
        <div className="fixed inset-0 min-h-screen z-150 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-4xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300 p-5 sm:p-10 relative">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-3 items-center z-10">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-xs font-bold uppercase tracking-tighter cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
                <option value="VES">VES</option>
              </select>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl sm:rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

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
                      {/* Mapeo dinámico de símbolos */}
                      {(() => {
                        switch (selectedCurrency) {
                          case "VES":
                            return "Bs ";
                          case "COP":
                            return "COP ";
                          case "USD":
                            return "$ ";
                          default:
                            return `${selectedCurrency} `; // Por si agregas más después
                        }
                      })()}

                      {convertPrice(
                        selectedCustomer.orders
                          ?.filter((o) => o.estado === "paid")
                          .reduce((sum, o) => sum + Number(o.total || 0), 0) ||
                          0,
                        "USD",
                        selectedCurrency,
                        exchange_rates,
                      ).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Historial de Compras
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-slate-100/50 dark:bg-slate-900/80 sticky top-0 z-10">
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
                          <tr
                            key={order.id}
                            className="hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                              #{toOrderCode(order)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              <div className="flex flex-col gap-1">
                                {order.items && Array.isArray(order.items) ? (
                                  order.items.slice(0, 3).map((item, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-medium block leading-tight truncate max-w-[200px]"
                                    >
                                      {item.name || item.title} (x
                                      {item.quantity})
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] italic text-slate-400">
                                    Sin detalle
                                  </span>
                                )}
                                {order.items?.length > 3 && (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    + {order.items.length - 3} más...
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-xs">
                              {(() => {
                                switch (selectedCurrency) {
                                  case "VES":
                                    return "Bs ";
                                  case "COP":
                                    return "COP ";
                                  case "USD":
                                    return "$ ";
                                  default:
                                    return `${selectedCurrency} `; // Por si agregas más después
                                }
                              })()}
                              {convertPrice(
                                Number(order.total),
                                "USD",
                                selectedCurrency,
                                exchange_rates,
                              ).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-black tracking-widest ${
                                  order.estado === "pending"
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                                    : order.estado === "paid"
                                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                      : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                }`}
                              >
                                {order.estado === "pending"
                                  ? "Pendiente"
                                  : order.estado === "paid"
                                    ? "Pagado"
                                    : "Cancelado"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {selectedCustomer.orders.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic text-xs">
                    Este cliente aún no ha realizado compras.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
