import React from "react";
import { DollarSign, Hash, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const PricingStock = ({
  formData,
  setFormData,
  readOnly = false,
  effectiveStock,
  autoCalculated = false,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasDiscount =
    formData.discount_price && parseFloat(formData.discount_price) > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
      {/* Precio Base */}
      <div className="space-y-2 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-4xl shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
          <DollarSign size={12} /> Precio Base ($)
        </label>
        <Input
          required
          type="number"
          name="price"
          step="0.01"
          placeholder="0.00"
          className="h-10 border-none bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl font-black text-xl px-4 focus:ring-0"
          value={formData.price}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>

      {/* Precio de Oferta */}
      <div
        className={`space-y-2 p-6 rounded-4xl transition-all duration-300 border ${
          hasDiscount
            ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 shadow-sm"
            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50"
        }`}
      >
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 ml-1 flex items-center gap-2">
          <TrendingDown size={12} /> Oferta ($)
        </label>
        <div className="relative">
          <Input
            type="number"
            name="discount_price"
            step="0.01"
            placeholder="Opcional"
            className={`h-10 border-none rounded-xl font-black text-xl px-4 focus:ring-0 ${
              hasDiscount
                ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400"
                : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500"
            }`}
            value={formData.discount_price}
            onChange={handleChange}
            disabled={readOnly}
          />
          {!hasDiscount && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 pointer-events-none">
              Sin descuento
            </span>
          )}
        </div>
      </div>

      {/* Stock Total */}
      <div className="space-y-2 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-4xl shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
          <Hash size={12} /> Stock Total
        </label>
        <Input
          required
          type="number"
          name="stock"
          placeholder="0"
          className="h-10 border-none bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl font-black text-xl px-4 focus:ring-0"
          value={autoCalculated ? effectiveStock : formData.stock}
          onChange={handleChange}
          disabled={readOnly || autoCalculated}
        />
        {autoCalculated && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            Se calcula automaticamente por la suma de variantes
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingStock;
