"use client";
import React, { useEffect, useState } from "react";
import {
  Eye,
  X,
  Check,
  Search,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAudit } from "@/lib/auditLog";
import { useSiteConfig } from "@/context/SiteConfigContext";
import Swal from "sweetalert2";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Todos los estados");
  const { tenant_id: tenantId } = useSiteConfig();
  const supabase = createClient();

  const toOrderCode = (id) => String(id || "").slice(-6).toUpperCase();
  const getErrorMessage = (error) =>
    error?.message || error?.details || "Error desconocido";

  const buildCustomerFromOrder = (order) => {
    const embedded = order?.customer || order?.cliente || {};
    return {
      nombre_completo:
        embedded?.nombre_completo ||
        order?.cliente_nombre ||
        order?.nombre_cliente ||
        order?.customer_name ||
        "Desconocido",
      telefono: embedded?.telefono || order?.telefono || "",
      cedula: embedded?.cedula || order?.cedula || "",
      email: embedded?.email || order?.email || "",
    };
  };

  const loadCustomersByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return new Map();

    const tables = ["clientes"];
    let lastError = null;

    for (const tableName of tables) {
      let query = supabase
        .from(tableName)
        .select("id, nombre_completo, telefono, cedula, email");

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      query = query.in("id", ids);
      const { data, error } = await query;

      if (!error) {
        return new Map((data || []).map((row) => [row.id, row]));
      }

      lastError = error;

      if (
        tenantId &&
        typeof error.message === "string" &&
        error.message.includes("tenant_id")
      ) {
        const retry = await supabase
          .from(tableName)
          .select("id, nombre_completo, telefono, cedula, email")
          .in("id", ids);
        if (!retry.error) {
          return new Map((retry.data || []).map((row) => [row.id, row]));
        }
        lastError = retry.error;
      }
    }

    if (lastError) {
      console.warn(
        "No se pudieron cargar datos de clientes relacionados:",
        getErrorMessage(lastError),
      );
    }

    return new Map();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!tenantId) {
        setOrders([]);
        return;
      }

      let query = supabase.from("orders").select("*");
      query = query.eq("tenant_id", tenantId);
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      const ordersData = data || [];
      const customerIds = [
        ...new Set(ordersData.map((order) => order.cliente_id).filter(Boolean)),
      ];
      const customersById = await loadCustomersByIds(customerIds);

      const mergedOrders = ordersData.map((order) => ({
        ...order,
        clientes:
          customersById.get(order.cliente_id) || buildCustomerFromOrder(order),
      }));

      setOrders(mergedOrders);
    } catch (error) {
      console.error("Error cargando órdenes:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Obtener usuario actual para la bitácora
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });
  }, [tenantId]);

  const updateStatus = async (id, newStatus, reason = null) => {
    if (!tenantId) {
      Swal.fire("Error", "No se pudo resolver tenant_id para actualizar.", "error");
      return;
    }

    const updateData = { estado: newStatus };
    if (reason) updateData.motivo_rechazo = reason;

    // Obtener la orden para enriquecer el log
    const orderRef = orders.find((o) => o.id === id);

    let updateQuery = supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("id, estado");
    if (tenantId) {
      updateQuery = updateQuery.eq("tenant_id", tenantId);
    }
    let { data: updatedOrder, error } = await updateQuery.maybeSingle();

    if (
      error &&
      reason &&
      typeof error.message === "string" &&
      error.message.includes("motivo_rechazo")
    ) {
      let fallbackQuery = supabase
        .from("orders")
        .update({ estado: newStatus })
        .eq("id", id)
        .select("id, estado");
      if (tenantId) {
        fallbackQuery = fallbackQuery.eq("tenant_id", tenantId);
      }
      const fallback = await fallbackQuery.maybeSingle();
      error = fallback.error;
      updatedOrder = fallback.data;
    }

    if (!error && !updatedOrder) {
      error = {
        message:
          "No se actualizó ninguna orden. Verifica tenant_id, permisos RLS o si la orden existe.",
      };
    }

    if (!error) {
      // Registrar en bitácora
      const accion = newStatus === "Completado" ? "aceptar" : "rechazar";
      await logAudit(supabase, {
        tipo: "orden",
        accion,
        descripcion: `Orden #${toOrderCode(id)} marcada como "${newStatus}"${reason ? ` — Motivo: ${reason}` : ""}`,
        usuario_id: currentUser?.id ?? null,
        usuario_nombre: currentUser?.email ?? "Admin",
        meta: {
          order_id: id,
          nuevo_estado: newStatus,
          motivo_rechazo: reason ?? null,
          cliente: orderRef?.clientes?.nombre_completo ?? null,
          total: orderRef?.total ?? null,
        },
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Orden marcada como ${newStatus}`,
        showConfirmButton: false,
        timer: 3000,
      });
      fetchOrders();
    } else {
      Swal.fire("Error", getErrorMessage(error), "error");
    }
  };

  const handleReject = async (id) => {
    const { value: formValues } = await Swal.fire({
      title: "Rechazar Orden",
      html:
        '<select id="swal-reason" class="swal2-select" style="max-width: 100%; width: 80%">' +
        '<option value="Referencia de pago inválida o no coincide">Referencia de pago inválida o no coincide</option>' +
        '<option value="Monto incompleto">Monto incompleto</option>' +
        '<option value="Otro">Otro (Especificar)</option>' +
        "</select>" +
        '<input id="swal-other-reason" class="swal2-input" placeholder="Especifique el motivo..." style="display:none; max-width: 100%; width: 80%">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      didOpen: () => {
        const select = document.getElementById("swal-reason");
        const input = document.getElementById("swal-other-reason");
        select.addEventListener("change", (e) => {
          if (e.target.value === "Otro") {
            input.style.display = "block";
          } else {
            input.style.display = "none";
          }
        });
      },
      preConfirm: () => {
        const select = document.getElementById("swal-reason").value;
        const input = document.getElementById("swal-other-reason").value;
        if (select === "Otro" && !input.trim()) {
          Swal.showValidationMessage("Debe especificar el motivo");
          return false;
        }
        return select === "Otro" ? input.trim() : select;
      },
    });

    if (formValues) {
      await updateStatus(id, "Cancelado", formValues);
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Filtro por texto (ID o Nombre)
    const matchesSearch =
      String(o.id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      o.clientes?.nombre_completo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchesStatus =
      statusFilter === "Todos los estados" || o.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          Ventas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitoreo y gestión de pedidos de clientes en tiempo real.
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
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-sm transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} // <--- Actualiza el estado
          className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-xs font-bold uppercase tracking-tighter cursor-pointer w-full md:w-auto"
        >
          <option value="Todos los estados">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* Tabla Estándar con scroll responsive */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                # Orden
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Cliente
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hidden sm:table-cell">
                Fecha
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Total
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Estado
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
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 italic"
                >
                  <Loader2 className="animate-spin inline mr-2" size={20} />
                  Sincronizando ventas...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      #{toOrderCode(order.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                      {order.clientes?.nombre_completo || "Desconocido"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter font-medium">
                      {order.clientes?.telefono}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                      <Calendar size={12} />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        order.estado === "Pendiente"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                          : order.estado === "Completado"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {order.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 text-slate-400 dark:text-slate-500">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:text-slate-900 cursor-pointer dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      {order.estado === "Pendiente" && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, "Completado")}
                            className="p-2 hover:text-emerald-600 cursor-pointer dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all"
                            title="Completar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="p-2 cursor-pointer hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-all"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 font-medium"
                >
                  No se encontraron ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles del Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 min-h-screen z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 p-8 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 cursor-pointer right-6 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-6">
              Detalles de la Orden{" "}
              <span className="text-slate-400 dark:text-slate-500">
                #{toOrderCode(selectedOrder.id)}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Información del Cliente
                </h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Nombre:
                    </span>{" "}
                    {selectedOrder.clientes?.nombre_completo || selectedOrder.cliente_nombre || "No registrado"}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      CI/RIF:
                    </span>{" "}
                    {selectedOrder.clientes?.cedula || "No registrado"}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Teléfono:
                    </span>{" "}
                    {selectedOrder.clientes?.telefono || "No registrado"}
                  </p>
                  {selectedOrder.clientes?.email && (
                    <p>
                      <span className="font-bold text-slate-900 dark:text-slate-300">
                        Email:
                      </span>{" "}
                      {selectedOrder.clientes.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Datos del Pago
                </h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Referencia:
                    </span>{" "}
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
                      {selectedOrder.referencia_pago || "No registrada"}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Total:
                    </span>{" "}
                    ${Number(selectedOrder.total).toFixed(2)}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900 dark:text-slate-300">
                      Estado:
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                        selectedOrder.estado === "Pendiente"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                          : selectedOrder.estado === "Completado"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {selectedOrder.estado}
                    </span>
                  </p>
                  {selectedOrder.estado === "Cancelado" &&
                    selectedOrder.motivo_rechazo && (
                      <p className="text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg text-xs font-medium">
                        Motivo Rechazo: {selectedOrder.motivo_rechazo}
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Artículos (Items)
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                  <ul className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-sm font-medium"
                      >
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white">
                            {item.name || item.title}{" "}
                            <span className="text-slate-500 dark:text-slate-400">
                              x{item.quantity}
                            </span>
                          </span>
                          {item.variant && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              Variante: {item.variant}
                            </span>
                          )}
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          $
                          {(Number(item.price) * Number(item.quantity)).toFixed(
                            2,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    No hay detalles de artículos disponibles en este esquema.
                  </p>
                )}
              </div>
            </div>

            {selectedOrder.notas && (
              <div className="mt-8 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Notas del Cliente
                </h3>
                <p className="text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 p-4 rounded-xl border border-amber-100/50 dark:border-amber-500/20 italic">
                  "{selectedOrder.notas}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
