import React from "react";
import {
  DollarSign,
  Hash,
  TrendingDown,
  Lock,
  AlertTriangle,
} from "lucide-react";
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

  // Estilo base para los contenedores de las cards (p-4 en móvil, p-5 en desktop)
  const cardBaseStyle =
    "group p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md transition-all duration-200 shadow-sm";

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Grid de Inputs: 1 columna en móvil, 3 en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Precio Base */}
        <div
          className={`${cardBaseStyle} focus-within:border-slate-400 dark:focus-within:border-slate-600`}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded">
                <DollarSign
                  size={12}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              Precio Base ($)
            </label>
          </div>
          <Input
            required
            type="number"
            name="price"
            step="0.01"
            placeholder="0.00"
            className="h-10 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 dark:text-white rounded-md font-bold text-lg px-3 focus-visible:ring-1 focus-visible:ring-slate-400 transition-all no-spin"
            value={formData.price}
            onChange={handleChange}
            disabled={readOnly}
          />
        </div>

        {/* Precio de Oferta */}
        <div
          className={`${cardBaseStyle} ${
            hasDiscount
              ? "bg-rose-50/30 dark:bg-rose-500/5 border-rose-200 dark:border-rose-900/50"
              : "focus-within:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <label
              className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                hasDiscount
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1 rounded ${hasDiscount ? "bg-rose-100 dark:bg-rose-900/30" : "bg-slate-100 dark:bg-slate-800"}`}
              >
                <TrendingDown size={12} />
              </div>
              Oferta ($)
            </label>
            {hasDiscount && (
              <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase">
                Activa
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              name="discount_price"
              step="0.01"
              placeholder="0.00"
              className={`h-10 rounded-md font-bold text-lg px-3 focus-visible:ring-1 transition-all no-spin ${
                hasDiscount
                  ? "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 focus-visible:ring-rose-400"
                  : "bg-slate-50/50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 focus-visible:ring-rose-200"
              }`}
              value={formData.discount_price}
              onChange={handleChange}
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Stock Total */}
        <div
          className={`${cardBaseStyle} ${autoCalculated || !formData.manage_stock ? "bg-slate-50/50 dark:bg-slate-900/50 border-dashed" : "focus-within:border-slate-400"}`}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded">
                <Hash size={12} />
              </div>
              Inventario
            </label>
            <div className="flex items-center gap-2">
              {!readOnly && !autoCalculated && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      manage_stock: !prev.manage_stock,
                    }))
                  }
                  className={`text-[9px] font-black cursor-pointer px-2 py-0.5 rounded transition-all ${
                    formData.manage_stock
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  {formData.manage_stock ? "SÍ" : "NO"}
                </button>
              )}
              {autoCalculated && <Lock size={10} className="text-slate-400" />}
            </div>
          </div>

          {formData.manage_stock ? (
            <>
              <Input
                required
                type="number"
                name="stock"
                placeholder="0"
                className={`h-10 border-slate-100 dark:border-slate-800 rounded-md font-bold text-lg px-3 transition-all no-spin ${
                  autoCalculated
                    ? "bg-transparent dark:text-slate-400 cursor-not-allowed border-none text-slate-500 shadow-none"
                    : "bg-slate-50/50 dark:bg-slate-950 dark:text-white focus-visible:ring-1 focus-visible:ring-slate-400 border-dashed"
                }`}
                value={autoCalculated ? effectiveStock : formData.stock}
                onChange={handleChange}
                disabled={readOnly || autoCalculated}
              />
              {autoCalculated && (
                <p className="mt-2 text-[9px] leading-tight font-medium uppercase tracking-tighter text-slate-400 dark:text-slate-500 italic">
                  Calculado por variantes
                </p>
              )}
            </>
          ) : (
            <div className="h-10 flex items-center px-3 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-md border border-emerald-100/50 dark:border-emerald-500/20">
              <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Disponibilidad Ilimitada
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de validación */}
      {hasDiscount &&
        parseFloat(formData.discount_price) >= parseFloat(formData.price) && (
          <div className="flex items-center justify-center w-full px-2">
            <span className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-amber-600 dark:text-amber-500 px-4 py-2 rounded-md uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 w-full md:w-auto text-center justify-center shadow-sm">
              <AlertTriangle size={14} strokeWidth={2.5} />
              El precio de oferta debe ser menor al precio base
            </span>
          </div>
        )}
    </div>
  );
};

export default PricingStock;
