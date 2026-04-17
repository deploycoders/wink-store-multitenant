import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Building2, Info } from "lucide-react";
import {
  DEFAULT_COMMERCE_SETTINGS,
  normalizeCommerceSettings,
} from "@/lib/siteConfig";
import { getReadablePaymentFields } from "@/lib/paymentMethodSchemas";
import { getValidationError } from "@/lib/checkoutValidation";

export function PaymentFields({
  formData,
  setFormData,
  paymentMethods = [],
  selectedPaymentMethod = "",
  commerceSettings,
  errors = {},
  setErrors,
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

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    const error = getValidationError(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink px-1">
          Método de Pago
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
                "px-5 h-11 rounded-md cursor-pointer border text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                selectedPaymentMethod === method
                  ? "bg-ink text-white border-ink shadow-lg shadow-ink/20"
                  : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400 hover:text-zinc-600",
              )}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {selectedPaymentMethod ? (
        <div className="rounded-md bg-[#F3F4F6] p-6 relative overflow-hidden">
          {/* Icono de fondo decorativo */}
          <Building2 className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-zinc-200/50 -rotate-12 pointer-events-none" />

          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
              <Info size={12} className="text-zinc-400" />
              Datos para realizar el pago
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
              {methodFields.map((entry) => (
                <div key={entry.key} className="space-y-1">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                    {entry.label}
                  </span>
                  <span className="block text-sm font-bold text-ink leading-tight">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>

            {methodConfig.instructions && (
              <div className="mt-6 pt-4 border-t border-zinc-200 text-[11px] text-zinc-500 italic leading-relaxed">
                {methodConfig.instructions}
              </div>
            )}

            {methodFields.length === 0 && !methodConfig.instructions && (
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Cargando instrucciones...
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink px-1">
          Referencia de pago
        </label>
        <Input
          type="text"
          value={formData.reference}
          onChange={(e) => handleInputChange("reference", e.target.value)}
          className={`rounded-md border-none bg-[#F3F4F6] focus-visible:ring-ink/10 h-14 text-sm placeholder:text-zinc-400 ${errors.reference ? "ring-2 ring-rose-500/50" : ""}`}
          placeholder="Ej: 123456789"
        />
        {errors.reference ? (
          <p className="text-[10px] font-bold text-rose-500 px-1">
            {errors.reference}
          </p>
        ) : (
          <p className="text-[10px] text-zinc-400 font-bold px-1 italic">
            Ingrese el comprobante de confirmación proporcionado por su banco.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink px-1">
          Notas del Pedido (Opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full min-h-24 rounded-md border-none bg-[#F3F4F6] p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10 transition-all placeholder:text-zinc-400"
          placeholder="Lugar de entrega, referencias, etc..."
        />
      </div>
    </div>
  );
}
