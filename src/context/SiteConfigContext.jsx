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
  normalizePromoDivider,
} from "@/lib/siteConfig";
import { createClient } from "@/lib/supabase/client";

const SiteConfigContext = createContext();

export function SiteConfigProvider({ children, tenantId = null, tenantSlug = null }) {
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
    loading: true,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getSiteConfig({ tenantId });
      setConfig((prev) => ({ 
        ...data, 
        tenant_slug: prev.tenant_slug, // Preservamos el slug que viene de props
        loading: false 
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
          filter: tenantId ? `tenant_id=eq.${tenantId}` : "id=eq.1",
        },
        (payload) => {
          setConfig((prev) => ({
            ...payload.new,
            tenant_slug: prev.tenant_slug,
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
            footer_settings: normalizeFooterSettings(payload.new.footer_settings),
            commerce_settings: normalizeCommerceSettings(
              payload.new.commerce_settings,
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
