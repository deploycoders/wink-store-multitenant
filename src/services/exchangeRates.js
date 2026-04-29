import { createClient } from "@supabase/supabase-js";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY || "8d8eda43d62673bd2fadb0d8";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

/**
 * Servicio para gestionar las tasas de cambio con caché en base de datos.
 */
export async function getExchangeRates(supabaseClient) {
  try {
    // 1. Intentar leer de la caché en DB
    const { data: cached, error: dbError } = await supabaseClient
      .from("exchange_rates")
      .select("*")
      .eq("id", "current_rates")
      .maybeSingle();

    const now = new Date();

    // Si tenemos caché y no ha caducado (asumimos 12 horas para ser conservadores)
    if (cached && cached.rates) {
      const lastUpdate = new Date(cached.last_update);
      const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 12) {
        console.log("[Exchange] Usando tasas de la caché.");
        return cached.rates;
      }
    }

    // 2. Si no hay caché o es vieja, pedir al API
    console.log("[Exchange] Actualizando tasas desde el API...");
    const response = await fetch(BASE_URL);
    const data = await response.json();

    if (data.result === "success") {
      const rates = data.conversion_rates;
      const nextUpdate = data.time_next_update_unix
        ? new Date(data.time_next_update_unix * 1000)
        : null;

      // 3. Guardar en caché (Upsert)
      await supabaseClient.from("exchange_rates").upsert({
        id: "current_rates",
        rates: rates,
        last_update: now.toISOString(),
        next_update: nextUpdate ? nextUpdate.toISOString() : null,
      });

      return rates;
    }

    return cached?.rates || null;
  } catch (error) {
    console.error("[Exchange] Error obteniendo tasas:", error);
    return null;
  }
}

/**
 * Formatea un precio basándose en la configuración del tenant.
 */
export function formatCurrency(amount, currencyCode = "USD") {
  const locales = {
    USD: "en-US",
    COP: "es-CO",
    VES: "es-VE",
  };

  const formatter = new Intl.NumberFormat(locales[currencyCode] || "en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Convierte un monto de una moneda base a una moneda destino usando las tasas proporcionadas.
 * @param {number} amount - El monto a convertir.
 * @param {string} baseCurrency - Moneda original del producto (ej: 'USD').
 * @param {string} targetCurrency - Moneda actual de la tienda (ej: 'COP').
 * @param {object} exchangeRates - Objeto con las tasas de cambio (ej: { COP: 4000, VES: 38 }).
 * @returns {number} El monto convertido.
 */
export function convertPrice(amount, baseCurrency = "USD", targetCurrency = "USD", exchangeRates = null) {
  if (!amount || isNaN(amount)) return 0;
  if (baseCurrency === targetCurrency || !exchangeRates) return Number(amount);

  const amountNum = Number(amount);

  // Si la moneda base es USD, solo multiplicamos por la tasa destino
  if (baseCurrency === "USD") {
    const rateTo = exchangeRates[targetCurrency] || 1;
    return amountNum * rateTo;
  }

  // Si queremos llevar a USD desde otra moneda
  if (targetCurrency === "USD") {
    const rateFrom = exchangeRates[baseCurrency] || 1;
    return amountNum / rateFrom;
  }

  // Conversión cruzada (ej. de COP a VES)
  const rateFrom = exchangeRates[baseCurrency] || 1;
  const rateTo = exchangeRates[targetCurrency] || 1;
  
  // Llevamos a USD y luego a la moneda destino
  return (amountNum / rateFrom) * rateTo;
}
