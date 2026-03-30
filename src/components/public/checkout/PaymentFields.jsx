import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PaymentFields({
  formData,
  setFormData,
  paymentMethods = [],
  selectedPaymentMethod = "",
}) {
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
              onClick={() => setFormData({ ...formData, paymentMethod: method })}
              className={cn(
                "px-4 h-10 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
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

      <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
          Referencia / ID de operación
        </label>
        <Input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
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
