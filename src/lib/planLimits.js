/**
 * planLimits.js - Comentado para desactivar funcionalidad de membresías.
 */

export const canAdd = () => true;
export const limitLabel = (current) => `${current} / ∞`;
export const usagePercent = () => 0;
export const usageColor = () => ({ bar: "bg-emerald-500", text: "text-emerald-600" });
export const PLAN_BADGES = {};
export const PLAN_DEFAULTS = {};

/*
export const PLAN_DEFAULTS = {
  bronze: {
    code: "bronze",
    display_name: "Bronze",
    max_users: 1,
    max_products: 10,
    max_categories: 3,
    max_images_per_product: 2,
    max_variants_per_product: 0,
    allow_audit_log: false,
    allow_advanced_settings: false,
    allow_color_branding: false,
  },
  silver: {
    code: "silver",
    display_name: "Silver",
    max_users: 3,
    max_products: 100,
    max_categories: 20,
    max_images_per_product: 5,
    max_variants_per_product: 5,
    allow_audit_log: true,
    allow_advanced_settings: true,
    allow_color_branding: true,
  },
  gold: {
    code: "gold",
    display_name: "Gold",
    max_users: 10,
    max_products: null,
    max_categories: null,
    max_images_per_product: 10,
    max_variants_per_product: null,
    allow_audit_log: true,
    allow_advanced_settings: true,
    allow_color_branding: true,
  },
};

export function canAdd(limit, current) {
  if (limit === null || limit === undefined) return true;
  return current < limit;
}

export function limitLabel(current, limit) {
  if (limit === null || limit === undefined) return `${current} / ∞`;
  return `${current} / ${limit}`;
}

export function usagePercent(current, limit) {
  if (!limit) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}

export function usageColor(percent) {
  if (percent >= 100) return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
  if (percent >= 80)  return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
}

export const PLAN_BADGES = {
  bronze: {
    label: "🥉 Bronze",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700/50",
    text: "text-amber-700 dark:text-amber-400",
  },
  silver: {
    label: "🥈 Silver",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-300",
  },
  gold: {
    label: "🥇 Gold",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-700/50",
    text: "text-yellow-700 dark:text-yellow-400",
  },
};
*/
