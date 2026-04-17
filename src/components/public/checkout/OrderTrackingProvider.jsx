"use client";

import React, { useEffect, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOrderTrackingStore } from "@/lib/useOrderTrackingStore";
import { useSiteConfig } from "@/context/SiteConfigContext";
import TrackingFloatingWidget from "./TrackingFloatingWidget";

const TrackingContext = createContext(null);

export function OrderTrackingProvider({ children }) {
  const { tenant_slug, tenant_id } = useSiteConfig();
  const { trackings, updateTrackingStatus } = useOrderTrackingStore();
  
  const currentTracking = tenant_slug ? trackings[tenant_slug] : null;
  const orderId = currentTracking?.orderId;

  useEffect(() => {
    if (!orderId || !tenant_slug) return;

    const supabase = createClient();

    // Suscripción a Realtime para captar cambios de estado
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          // Validar que el cambio pertenece al tenant actual por seguridad
          if (tenant_id && payload.new.tenant_id !== tenant_id) return;
          
          const newStatus = payload.new.estado;
          if (newStatus) {
            updateTrackingStatus(tenant_slug, newStatus);
          }
        }
      )
      .subscribe();

    // Fallback Polling (cada 10 segundos) por si Realtime falla
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("estado")
        .eq("id", orderId)
        .maybeSingle();

      if (!error && data?.estado && data.estado !== currentTracking.status) {
        updateTrackingStatus(tenant_slug, data.estado);
      }
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderId, tenant_slug, tenant_id, currentTracking?.status, updateTrackingStatus]);

  return (
    <TrackingContext.Provider value={currentTracking}>
      {children}
      {currentTracking && <TrackingFloatingWidget />}
    </TrackingContext.Provider>
  );
}

export const useTracking = () => useContext(TrackingContext);
