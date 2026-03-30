import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_COMMERCE_SETTINGS,
  normalizeCommerceSettings,
  normalizeWhatsappNumber,
} from "@/lib/siteConfig";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function ValidationWaitScreen({ orderId, onSuccess, whatsappNumber }) {
  const [status, setStatus] = useState("Pendiente");
  const [motivo, setMotivo] = useState("");
  const { commerce_settings, tenant_id } = useSiteConfig();
  const commerce = normalizeCommerceSettings(
    commerce_settings || DEFAULT_COMMERCE_SETTINGS,
  );
  const configuredWhatsapp = normalizeWhatsappNumber(commerce.whatsapp_number);
  const supportWhatsapp = whatsappNumber || configuredWhatsapp;
  const supportMessage = `Hola, mi pedido #${orderId.slice(-6).toUpperCase()} fue rechazado. El motivo indicado es: "${motivo}". Necesito ayuda con esto.`;
  const supportHref = supportWhatsapp
    ? `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(supportMessage)}`
    : "/checkout";

  useEffect(() => {
    if (!orderId) return;

    const supabase = createClient();

    // Check immediately in case it was processed very fast
    const checkCurrentStatus = async () => {
      let query = supabase
        .from("orders")
        .select("estado, motivo_rechazo, tenant_id")
        .eq("id", orderId);

      if (tenant_id) {
        query = query.eq("tenant_id", tenant_id);
      }

      const { data } = await query.single();
      if (data) {
        if (data.estado === "Completado") {
          onSuccess();
        } else if (data.estado === "Cancelado") {
          setStatus("Cancelado");
          setMotivo(data.motivo_rechazo || "Verifica los datos de tu pago e intenta nuevamente.");
        }
      }
    };
    checkCurrentStatus();

    // Suscripción a Realtime
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (tenant_id && payload.new.tenant_id !== tenant_id) return;
          const newStatus = payload.new.estado;
          if (newStatus === "Completado") {
            onSuccess();
          } else if (newStatus === "Cancelado") {
            setStatus("Cancelado");
            setMotivo(payload.new.motivo_rechazo || "Verifica los datos de tu pago e intenta nuevamente.");
          }
        }
      )
      .subscribe();

    // Polling fallback: En caso de que Realtime no esté activado en la tabla `orders`
    const intervalId = setInterval(() => {
      checkCurrentStatus();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [orderId, onSuccess, tenant_id]);

  if (status === "Cancelado") {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-8 text-center min-h-[50vh]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500"
        >
          <AlertCircle size={48} />
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-3xl font-serif font-black text-ink uppercase tracking-tight">
            Pago Rechazado
          </h2>
          <p className="text-honey-dark max-w-sm mx-auto">
            Lo sentimos, tu pago no pudo ser validado.
          </p>
          
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-sm font-bold text-rose-800 max-w-md mx-auto">
            <span className="block text-[10px] uppercase tracking-widest text-rose-400 mb-2">Motivo del rechazo:</span>
            {motivo}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={supportHref}
            target={supportWhatsapp ? "_blank" : undefined}
            rel={supportWhatsapp ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105"
          >
             Contactar Soporte
          </a>
          <Link href="/checkout">
            <Button className="flex items-center gap-2 bg-ink text-paper px-8 h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105">
               Volver a Intentar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Waiting Screen
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8 text-center min-h-[50vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="text-ink"
      >
        <Loader2 size={64} className="opacity-20" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-black text-ink uppercase tracking-tight animate-pulse">
          Validando tu pago...
        </h2>
        <p className="text-honey-dark max-w-sm mx-auto text-sm">
          Por favor, espera en esta pantalla mientras nuestro equipo confirma tu pago.
          Recuerda que también hemos enviado la solicitud por WhatsApp.
        </p>
        <div className="text-[10px] uppercase tracking-widest text-honey-dark/50 font-bold bg-white px-4 py-2 rounded-full border border-honey-light inline-block mt-4">
          Orden #{orderId.slice(-6).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
