"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

const STORAGE_KEY = "pendingOrderTracking";

const normalizeStatus = (status) => {
  const raw = String(status || "").toLowerCase();
  if (raw.includes("paid") || raw.includes("completado")) return "paid";
  if (raw.includes("cancel") || raw.includes("cancelado")) return "cancelled";
  if (raw.includes("pendiente") || raw.includes("pending")) return "pending";
  return "pending";
};

const getStatusConfig = (status) => {
  switch (status) {
    case "paid":
      return {
        label: "Pago validado",
        description:
          "Tu pago ya fue confirmado. Puedes aceptar este seguimiento y seguir navegando.",
        badge: "VALIDADO",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        label: "Pago rechazado",
        description:
          "El pago fue rechazado. Revisa tu referencia y vuelve a intentar desde el checkout.",
        badge: "RECHAZADO",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Pago pendiente",
        description:
          "Aún estamos esperando la validación del pago. Puedes seguir navegando y regresar cuando quieras.",
        badge: "PENDIENTE",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: Loader2,
      };
  }
};

const buildOrderCode = (orderId) => {
  const safeId = orderId ? String(orderId) : "";
  return safeId ? safeId.slice(-6).toUpperCase() : "N/A";
};

export default function OrderTrackingWidget() {
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params?.tenant || "";
  const [tracking, setTracking] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkoutPath = tenantSlug ? `/${tenantSlug}/checkout` : "/checkout";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = JSON.parse(raw);
      if (stored?.orderId) {
        setTracking({
          orderId: String(stored.orderId),
          status: normalizeStatus(stored.status),
          rawStatus: stored.rawStatus || stored.status || "pending",
          tenantSlug: stored.tenantSlug || tenantSlug,
          orderCode: stored.orderCode || buildOrderCode(stored.orderId),
          reason: stored.reason || "",
          createdAt: stored.createdAt || Date.now(),
          updatedAt: stored.updatedAt || Date.now(),
        });
      }
    } catch (error) {
      console.warn("OrderTrackingWidget: cannot parse localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (!tracking?.orderId) return;
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
  }, [tracking]);

  useEffect(() => {
    if (!tracking?.orderId) return;

    const supabase = createClient();
    let isActive = true;

    const normalizePayloadStatus = (status) => {
      const nextStatus = normalizeStatus(status);
      const reason =
        nextStatus === "cancelled"
          ? "Verifica los datos de tu pago e intenta nuevamente."
          : "";

      setTracking((current) => {
        if (!current) return current;
        if (current.status === nextStatus && current.reason === reason) {
          return current;
        }

        return {
          ...current,
          status: nextStatus,
          rawStatus: status,
          reason,
          updatedAt: Date.now(),
        };
      });
    };

    const checkCurrentStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("estado")
        .eq("id", tracking.orderId)
        .single();

      if (!isActive || error || !data) return;
      normalizePayloadStatus(data.estado);
    };

    checkCurrentStatus();

    const channel = supabase
      .channel(`order-${tracking.orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${tracking.orderId}`,
        },
        (payload) => {
          if (!isActive || !payload?.new) return;
          normalizePayloadStatus(payload.new.estado);
        },
      )
      .subscribe();

    const intervalId = window.setInterval(checkCurrentStatus, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [tracking?.orderId]);

  const handleCloseWidget = () => setIsMinimized(true);

  const handleRestoreWidget = () => setIsMinimized(false);

  const handleClearTracking = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setTracking(null);
    setIsMinimized(false);
  };

  const handleGoToCheckout = () => router.push(checkoutPath);

  if (isLoading || !tracking?.orderId) return null;

  const statusData = getStatusConfig(tracking.status);
  const isFinal = tracking.status === "paid" || tracking.status === "cancelled";

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-100">
        <button
          type="button"
          onClick={handleRestoreWidget}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-paper shadow-2xl transition hover:bg-ink/90"
        >
          <ArrowRight size={16} />
          Seguimiento {statusData.badge}
          <span className="ml-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black">
            #{tracking.orderCode}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-100 w-full max-w-sm rounded-[28px] border bg-white/95 p-4 shadow-2xl ring-1 ring-zinc-200 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${statusData.bg} ${statusData.text}`}
            >
              <statusData.icon size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Seguimiento de pago
              </p>
              <h3 className="text-sm font-black uppercase tracking-tight text-ink">
                {statusData.label}
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {statusData.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCloseWidget}
          className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100"
          aria-label="Ocultar seguimiento"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-zinc-100 bg-zinc-50 p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          <span>ID de orden</span>
          <span>#{tracking.orderCode}</span>
        </div>
        {tracking.status === "cancelled" ? (
          <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-bold text-rose-700">
            {tracking.reason}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {!isFinal ? (
          <Button
            type="button"
            onClick={handleGoToCheckout}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-paper transition hover:bg-ink/90"
          >
            Ir al checkout
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleClearTracking}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-paper transition hover:bg-ink/90"
          >
            Aceptar y cerrar
          </Button>
        )}

        <button
          type="button"
          onClick={handleCloseWidget}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-zinc-50"
        >
          Minimizar
        </button>
      </div>
    </div>
  );
}
