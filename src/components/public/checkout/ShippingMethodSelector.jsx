"use client";

import React from "react";
import { Truck, Store } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { convertPrice } from "@/services/exchangeRates";

export function ShippingMethodSelector({ formData, setFormData, deliveryFee }) {
  const { commerce_settings, exchange_rates } = useSiteConfig();
  const currencySymbol = commerce_settings?.currency_symbol || "$";
  const targetCurrency = commerce_settings?.currency_code || "USD";

  const deliveryFeeConverted = convertPrice(
    Number(deliveryFee) || 0,
    "USD",
    targetCurrency,
    exchange_rates
  );

  const methods = [
    {
      id: "delivery",
      label: "Envío a Domicilio",
      description: `Te lo llevamos a casa por ${currencySymbol}${deliveryFeeConverted.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: "pickup",
      label: "Retiro en Tienda",
      description: "Pasa por nuestro local y ahorra el envío",
      icon: <Store className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => setFormData({ ...formData, shippingMethod: method.id })}
          className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
            formData.shippingMethod === method.id
              ? "border-ink bg-zinc-50 ring-4 ring-zinc-100"
              : "border-zinc-100 hover:border-zinc-200"
          }`}
        >
          <div className={`p-3 rounded-xl ${
            formData.shippingMethod === method.id ? "bg-ink text-white" : "bg-zinc-100 text-zinc-500"
          }`}>
            {method.icon}
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-widest text-ink mb-1">
              {method.label}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium">
              {method.id === "delivery" && Number(deliveryFee) === 0 
                ? "Envío gratuito configurado" 
                : method.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
