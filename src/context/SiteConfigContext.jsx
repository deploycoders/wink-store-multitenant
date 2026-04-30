"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_HEADER_MENU,
  DEFAULT_HOME_INTRO,
  DEFAULT_PROMO_DIVIDER,
  DEFAULT_PRODUCTS_INTRO,
  DEFAULT_SITE_NAME,
  getSiteConfig,
  normalizeCommerceSettings,
  normalizeFooterSettings,
  normalizeHeaderMenu,
  normalizeHeroSlides,
  normalizePromoDivider,
} from "@/lib/siteConfig";
import { createClient } from "@/lib/supabase/client";

import { getExchangeRates } from "@/services/exchangeRates";

const SiteConfigContext = createContext();

const resolveLegacyFooterSettings = (row = {}) => {
  const legacy = row?.footer_commerce;
  if (!legacy || typeof legacy !== "object") return null;
  return legacy.footer_settings || legacy.footer || legacy;
};

const resolveLegacyCommerceSettings = (row = {}) => {
  const legacy = row?.footer_commerce;
  if (!legacy || typeof legacy !== "object") return null;
  return legacy.commerce_settings || legacy.commerce || legacy;
};

export function SiteConfigProvider({
  children,
  tenantId = null,
  tenantSlug = null,
}) {
  const [config, setConfig] = useState({
    tenant_id: tenantId,
    tenant_slug: tenantSlug,
    site_name: DEFAULT_SITE_NAME,
    hero_slides: [],
    home_intro: DEFAULT_HOME_INTRO,
    products_intro: DEFAULT_PRODUCTS_INTRO,
    header_menu: DEFAULT_HEADER_MENU,
    promo_divider: DEFAULT_PROMO_DIVIDER,
    footer_settings: DEFAULT_FOOTER_SETTINGS,
    commerce_settings: DEFAULT_COMMERCE_SETTINGS,
    exchange_rates: null,
    loading: true,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const supabase = createClient();

      // Cargar config en paralelo
      const data = await getSiteConfig({ tenantId });

      // Cargar tasas de cambio sin bloquear el render
      // Si ya hay tasas en localStorage/DB, esto será muy rápido
      const rates = await getExchangeRates(supabase);

      setConfig((prev) => ({
        ...data,
        hero_slides: normalizeHeroSlides(data.hero_slides),
        tenant_slug: prev.tenant_slug, // Preservamos el slug que viene de props
        exchange_rates: rates || prev.exchange_rates, // Mantener tasas anteriores si falla
        loading: false,
      }));
    } catch (error) {
      console.error("Context fetch error:", error);
      setConfig((prev) => ({ ...prev, loading: false }));
    }
  }, [tenantId]);

  useEffect(() => {
    const loadConfig = async () => {
      await fetchConfig();
    };
    loadConfig();

    // Real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel(`site_settings_changes_${tenantId || "default"}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_settings",
          filter: tenantId ? `tenant_id=eq.${tenantId}` : "tenant_id=eq.1",
        },
        (payload) => {
          setConfig((prev) => ({
            ...payload.new,
            tenant_slug: prev.tenant_slug,
            hero_slides: normalizeHeroSlides(payload.new.hero_slides),
            home_intro: {
              ...DEFAULT_HOME_INTRO,
              ...(payload.new.home_intro || {}),
            },
            products_intro: {
              ...DEFAULT_PRODUCTS_INTRO,
              ...(payload.new.products_intro || {}),
            },
            header_menu: normalizeHeaderMenu(payload.new.header_menu),
            promo_divider: normalizePromoDivider(payload.new.promo_divider),
            footer_settings: normalizeFooterSettings(
              payload.new.footer_settings ||
                resolveLegacyFooterSettings(payload.new),
            ),
            commerce_settings: normalizeCommerceSettings(
              payload.new.commerce_settings ||
                resolveLegacyCommerceSettings(payload.new),
            ),
            loading: false,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchConfig]);

  return (
    <SiteConfigContext.Provider value={{ ...config, refresh: fetchConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
};
