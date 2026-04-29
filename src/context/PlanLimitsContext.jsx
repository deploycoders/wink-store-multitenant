"use client";

import React, { createContext, useContext } from "react";

/**
 * PlanLimitsContext - Comentado para desactivar funcionalidad de membresías.
 * Proporciona valores ilimitados por defecto para evitar errores en componentes que aún lo usen.
 */
const PlanLimitsContext = createContext(null);

export function PlanLimitsProvider({ children }) {
  // Helpers que siempre retornan true (ilimitado)
  const value = {
    planCode: "unlimited",
    planLimits: {
      display_name: "Ilimitado",
      max_products: null,
      max_users: null,
      max_categories: null,
    },
    counts: { products: 0, categories: 0, users: 0 },
    loading: false,
    refresh: () => {},
    canAddProduct: () => true,
    canAddCategory: () => true,
    canAddUser: () => true,
    canUseVariants: () => true,
    canUseAuditLog: () => true,
    canUseAdvancedSettings: () => true,
    canUseColorBranding: () => true,
  };

  return (
    <PlanLimitsContext.Provider value={value}>
      {children}
    </PlanLimitsContext.Provider>
  );
}

export function usePlanLimits() {
  const ctx = useContext(PlanLimitsContext);
  if (!ctx) {
    // Si no hay provider (porque lo quitamos de AdminLayoutClient), devolvemos el objeto unlimited directamente
    return {
        planCode: "unlimited",
        planLimits: {
          display_name: "Ilimitado",
          max_products: null,
          max_users: null,
          max_categories: null,
        },
        counts: { products: 0, categories: 0, users: 0 },
        loading: false,
        refresh: () => {},
        canAddProduct: () => true,
        canAddCategory: () => true,
        canAddUser: () => true,
        canUseVariants: () => true,
        canUseAuditLog: () => true,
        canUseAdvancedSettings: () => true,
        canUseColorBranding: () => true,
      };
  }
  return ctx;
}

/*
import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { PLAN_DEFAULTS, canAdd } from "@/lib/planLimits";

export function PlanLimitsProvider({ children }) {
  const { tenant_id: tenantId } = useSiteConfig();
  const supabase = createClient();

  const [planLimits, setPlanLimits] = useState(PLAN_DEFAULTS.bronze);
  const [planCode, setPlanCode] = useState("bronze");
  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    users: 0,
  });

  const fetchPlanAndCounts = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("plan_id, plan_type, plan")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      let limits = PLAN_DEFAULTS.bronze;
      let code = "bronze";

      if (tenant?.plan_id) {
        const { data: planRow } = await supabase
          .from("plans")
          .select("*")
          .eq("id", tenant.plan_id)
          .maybeSingle();

        if (planRow) {
          code = planRow.code?.toLowerCase() || "bronze";
          limits = {
            ...(PLAN_DEFAULTS[code] || PLAN_DEFAULTS.bronze),
            ...planRow,
            code,
          };
        }
      } else {
        const planText = (
          tenant?.plan_type ||
          tenant?.plan ||
          "bronze"
        ).toLowerCase();
        code = ["bronze", "silver", "gold"].includes(planText)
          ? planText
          : "bronze";
        limits = PLAN_DEFAULTS[code] || PLAN_DEFAULTS.bronze;
      }

      setPlanCode(code);
      setPlanLimits(limits);

      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      const { count: userCount } = await supabase
        .from("staff_profiles")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      setCounts({
        products: productCount || 0,
        categories: categoryCount || 0,
        users: userCount || 0,
      });
    } catch (err) {
      console.error("[PlanLimits] Error fetching plan:", err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchPlanAndCounts();
  }, [fetchPlanAndCounts]);

  const canAddProduct  = () => canAdd(planLimits.max_products,   counts.products);
  const canAddCategory = () => canAdd(planLimits.max_categories, counts.categories);
  const canAddUser     = () => canAdd(planLimits.max_users,      counts.users);
  const canUseVariants = () => (planLimits.max_variants_per_product ?? 0) !== 0;
  const canUseAuditLog = () => planLimits.allow_audit_log !== false;
  const canUseAdvancedSettings = () => planLimits.allow_advanced_settings !== false;
  const canUseColorBranding    = () => planLimits.allow_color_branding !== false;

  return (
    <PlanLimitsContext.Provider
      value={{
        planCode,
        planLimits,
        counts,
        loading,
        refresh: fetchPlanAndCounts,
        canAddProduct,
        canAddCategory,
        canAddUser,
        canUseVariants,
        canUseAuditLog,
        canUseAdvancedSettings,
        canUseColorBranding,
      }}
    >
      {children}
    </PlanLimitsContext.Provider>
  );
}
*/
