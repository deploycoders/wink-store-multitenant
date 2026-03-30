import { createClient } from "./supabase/client";

export const DEFAULT_SITE_NAME = "Wink Store";
export const DEFAULT_SITE_HOSTNAME = "wink-store.com";
export const DEFAULT_SITE_HANDLE = "wink_store";

const normalizeToSlug = (value, fallback) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || fallback;

const normalizeToHostname = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") ||
  DEFAULT_SITE_HOSTNAME.replace(/^https?:\/\//, "");

export const formatSiteHandle = (value) =>
  normalizeToSlug(value, DEFAULT_SITE_HANDLE);
export const formatSiteHostname = (value) => normalizeToHostname(value);

export const DEFAULT_HOME_INTRO = {
  title: "Elevando tu Estilo Diario",
  description:
    "Descubre una selección exclusiva donde la calidad superior se encuentra con el diseño atemporal. Nuestras piezas aseguran que inviertas en prendas que te acompañarán por años.",
};

export const DEFAULT_PRODUCTS_INTRO = {
  title: "Tu tienda de estilo",
  description:
    "Diseños meticulosos, materiales nobles y una estética que trasciende las temporadas. Encuentra tu próxima pieza esencial.",
};

export const DEFAULT_HEADER_MENU = [
  {
    id: "slot-1",
    label: "Hombres",
    target_type: "category",
    target_id: null,
  },
  {
    id: "slot-2",
    label: "Mujeres",
    target_type: "category",
    target_id: null,
  },
];

export const DEFAULT_PROMO_DIVIDER = {
  eyebrow: "Archive 2026",
  title_primary: "The New",
  title_secondary: "Standard",
  description:
    "Piezas diseñadas para resistir el paso del tiempo y las tendencias globales.",
  cta_label: "Explorar Selección",
  footer_text: "Minimal Aesthetics — Edition 001",
  image: "/banner-image2.jpg",
};

export const DEFAULT_FOOTER_SETTINGS = {
  description:
    "Curamos piezas esenciales para el guardarropa contemporaneo. Estetica minimalista con un enfoque en la durabilidad y el diseno.",
  instagram_url: "",
  facebook_url: "",
  twitter_url: "",
};

export const DEFAULT_COMMERCE_SETTINGS = {
  whatsapp_number: "58412555555",
  customer_phone_country_code: "58",
  bank_name: "Bancamiga (0172)",
  bank_phone: "0424-5883315",
  bank_document: "V-12345678",
  payment_methods: ["Pago Movil"],
  payment_method_configs: {
    "Pago Movil": {
      owner: "",
      identifier: "",
      contact: "",
      extra: "",
      instructions: "",
    },
    Zelle: {
      owner: "",
      identifier: "",
      contact: "",
      extra: "",
      instructions: "",
    },
    PayPal: {
      owner: "",
      identifier: "",
      contact: "",
      extra: "",
      instructions: "",
    },
    Binance: {
      owner: "",
      identifier: "",
      contact: "",
      extra: "",
      instructions: "",
    },
    Transferencia: {
      owner: "",
      identifier: "",
      contact: "",
      extra: "",
      instructions: "",
    },
  },
  product_notices: [
    "Los envios se realizan de lunes a viernes por MRW y/o Zoom, con un tiempo estimado de entrega de 1 a 3 dias habiles dependiendo de tu ubicacion.",
    "No se hacen devoluciones ni cambios, asegurate de elegir la talla correcta. Si tienes dudas, contactanos antes de comprar.",
  ],
  privacy_title: "Politica de Privacidad",
  privacy_content:
    "Aqui puedes explicar como recolectas, usas y proteges los datos de tus clientes. Incluye contacto para dudas y el periodo de retencion de informacion.",
  terms_title: "Terminos y Condiciones",
  terms_content:
    "Aqui puedes definir condiciones de compra, envios, devoluciones, garantias, limitaciones de responsabilidad y uso general de la tienda.",
};

export const normalizeHeaderMenu = (menu) => {
  if (!Array.isArray(menu) || menu.length === 0) return DEFAULT_HEADER_MENU;

  return DEFAULT_HEADER_MENU.map((fallbackItem, index) => {
    const item = menu[index] || {};
    return {
      id: item.id || fallbackItem.id,
      label: item.label || fallbackItem.label,
      target_type:
        item.target_type === "subcategory" ? "subcategory" : "category",
      target_id: item.target_id || null,
    };
  });
};

export const normalizePromoDivider = (promoDivider) => ({
  ...DEFAULT_PROMO_DIVIDER,
  ...(promoDivider || {}),
});

export const normalizeFooterSettings = (footerSettings) => ({
  ...DEFAULT_FOOTER_SETTINGS,
  ...(footerSettings || {}),
});

export const normalizeCommerceSettings = (commerceSettings) => {
  const normalized = {
    ...DEFAULT_COMMERCE_SETTINGS,
    ...(commerceSettings || {}),
  };

  return {
    ...normalized,
    customer_phone_country_code:
      String(normalized.customer_phone_country_code || "58")
        .replace(/\D/g, "")
        .trim() || "58",
    payment_methods: Array.isArray(normalized.payment_methods)
      ? normalized.payment_methods.filter((method) =>
          [
            "Pago Movil",
            // "PayPal",
            // "Zelle",
            // "Binance",
            // "Transferencia",
          ].includes(method),
        )
      : DEFAULT_COMMERCE_SETTINGS.payment_methods,
    payment_method_configs: (() => {
      const defaults = DEFAULT_COMMERCE_SETTINGS.payment_method_configs;
      const fromPayload = normalized.payment_method_configs || {};
      const legacyDetails = normalized.payment_method_details || {};

      return Object.fromEntries(
        Object.entries(defaults).map(([method, defaultConfig]) => {
          const nextConfig = {
            ...defaultConfig,
            ...(fromPayload[method] || {}),
          };

          if (!nextConfig.instructions && legacyDetails[method]) {
            nextConfig.instructions = String(legacyDetails[method]);
          }

          return [method, nextConfig];
        }),
      );
    })(),
    product_notices: Array.isArray(normalized.product_notices)
      ? normalized.product_notices
          .map((notice) => String(notice || "").trim())
          .filter(Boolean)
          .slice(0, 3)
      : DEFAULT_COMMERCE_SETTINGS.product_notices,
  };
};

export const normalizeWhatsappNumber = (value) =>
  String(value || "").replace(/\D/g, "");

export const formatWhatsappContactNumber = (
  value,
  defaultCountryCode = "58",
) => {
  const digits = normalizeWhatsappNumber(value);
  const countryCode = normalizeWhatsappNumber(defaultCountryCode) || "58";

  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith(countryCode)) return digits;
  if (digits.startsWith("0")) return `${countryCode}${digits.slice(1)}`;
  if (digits.length <= 10) return `${countryCode}${digits}`;
  return digits;
};

export const getSiteConfig = async ({ tenantId, tenantSlug } = {}) => {
  const supabase = createClient();

  let activeTenantId = tenantId;

  // 1. Si no tenemos ID pero tenemos SLUG, lo buscamos
  if (!activeTenantId && tenantSlug) {
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .eq("is_active", true)
      .maybeSingle();
    activeTenantId = tenantRow?.id;
  }

  // 2. Si finalmente no hay ID, devolvemos los defaults
  if (!activeTenantId) {
    return returnDefaults();
  }

  // 3. Usamos maybeSingle() para que si no hay datos, data sea null en lugar de lanzar error
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("tenant_id", activeTenantId)
    .maybeSingle();

  // 3. Si hay un error real de conexión o la tabla no existe
  if (error) {
    console.error("Error crítico de base de datos:", error.message);
    return returnDefaults();
  }

  // 4. Si la consulta fue exitosa pero no hay datos (tabla vacía)
  if (!data) {
    return returnDefaults();
  }

  // 5. Si hay datos, normalizamos
  return {
    ...data,
    home_intro: { ...DEFAULT_HOME_INTRO, ...(data.home_intro || {}) },
    products_intro: {
      ...DEFAULT_PRODUCTS_INTRO,
      ...(data.products_intro || {}),
    },
    header_menu: normalizeHeaderMenu(data.header_menu),
    promo_divider: normalizePromoDivider(data.promo_divider),
    footer_settings: normalizeFooterSettings(data.footer_settings),
    commerce_settings: normalizeCommerceSettings(data.commerce_settings),
  };
};

// Función auxiliar para no repetir código
const returnDefaults = () => ({
  site_name: DEFAULT_SITE_NAME,
  hero_slides: [
    {
      id: 1,
      subtitle: "- Colecciones",
      title: "Explora",
      description: "...",
      image: "/banner-clothes.jpg",
    },
  ],
  home_intro: DEFAULT_HOME_INTRO,
  products_intro: DEFAULT_PRODUCTS_INTRO,
  header_menu: DEFAULT_HEADER_MENU,
  promo_divider: DEFAULT_PROMO_DIVIDER,
  footer_settings: DEFAULT_FOOTER_SETTINGS,
  commerce_settings: DEFAULT_COMMERCE_SETTINGS,
});

export const updateSiteConfig = async (payload, { tenantId } = {}) => {
  const supabase = createClient();
  let query = supabase
    .from("site_settings")
    .update({ ...payload, updated_at: new Date() });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  } else {
    query = query.eq("id", 1);
  }

  const { data, error } = await query.select().single();

  if (error) throw error;
  return data;
};
