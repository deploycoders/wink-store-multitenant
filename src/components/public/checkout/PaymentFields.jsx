import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_COMMERCE_SETTINGS,
  normalizeCommerceSettings,
} from "@/lib/siteConfig";
import { getReadablePaymentFields } from "@/lib/paymentMethodSchemas";

export function PaymentFields({
  formData,
  setFormData,
  paymentMethods = [],
  selectedPaymentMethod = "",
  commerceSettings,
}) {
  const commerce = normalizeCommerceSettings(
    commerceSettings || DEFAULT_COMMERCE_SETTINGS,
  );
  const methodConfig =
    commerce.payment_method_configs?.[selectedPaymentMethod] || {};
  const methodFields = getReadablePaymentFields(
    selectedPaymentMethod,
    methodConfig,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
          Metodo de pago
        </label>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() =>
                setFormData({ ...formData, paymentMethod: method })
              }
              className={cn(
                "px-4 h-10 rounded-full cursor-pointer border text-[10px] font-black uppercase tracking-widest transition-all",
                selectedPaymentMethod === method
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-slate-500 border-slate-200 hover:border-ink hover:text-ink",
              )}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
      {selectedPaymentMethod ? (
        <div className="rounded-2xl border border-honey-light/50 bg-honey-light/20 p-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-honey-dark/70">
            Datos para pagar con {selectedPaymentMethod}
          </p>
          <div className="space-y-1 text-[11px] text-honey-dark">
            {methodFields.map((entry) => (
              <p key={entry.key}>
                <span className="font-bold">{entry.label}:</span> {entry.value}
              </p>
            ))}
            {methodConfig.instructions ? (
              <p className="whitespace-pre-line">{methodConfig.instructions}</p>
            ) : null}
            {methodFields.length === 0 && !methodConfig.instructions ? (
              <p className="text-[10px] uppercase tracking-wider text-honey-dark/60">
                Este método no tiene datos configurados todavía.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
          Referencia / ID de operación / Comprobante
        </label>
        <Input
          type="text"
          value={formData.reference}
          onChange={(e) =>
            setFormData({ ...formData, reference: e.target.value })
          }
          className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
          placeholder="000000"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
          Notas adicionales (Opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full min-h-24 rounded-2xl border border-honey-light/50 bg-transparent p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10 transition-all placeholder:text-honey-dark/40"
          placeholder="Ej: Talla M, Color Blanco..."
        />
      </div>
    </div>
  );
}
