import React from "react";
import {
  Settings,
  Plus,
  Trash2,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const VariantManager = ({ formData, setFormData, readOnly = false }) => {
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: "Talla", value: "", price_adjustment: 0, stock_adjustment: 0 },
      ],
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const noVariantsClass =
    "py-12 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-4xl flex flex-col items-center justify-center gap-2 grayscale opacity-40";
  return (
    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Configuración de Variantes
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
              Tallas, Colores y Ediciones Especiales
            </p>
          </div>
        </div>
        {!readOnly && (
          <Button
            type="button"
            onClick={addVariant}
            variant="outline"
            className="rounded-xl cursor-pointer border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all gap-2 text-[10px] font-black uppercase px-4 h-10"
          >
            <Plus size={14} /> Añadir Variante
          </Button>
        )}
      </div>

      {formData.variants.length === 0 ? (
        <div className={noVariantsClass}>
          <Settings size={32} className="text-slate-300 dark:text-slate-600" />
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Sin variantes configuradas
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {formData.variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:hover:shadow-none transition-all group animate-in zoom-in-95 duration-200"
            >
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-300 dark:text-slate-500 ml-1">
                  Atributo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Talla"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                  value={v.name}
                  onChange={(e) => updateVariant(idx, "name", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-300 dark:text-slate-500 ml-1">
                  Valor
                </label>
                <input
                  type="text"
                  placeholder="Ej. L o Rojo"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                  value={v.value}
                  onChange={(e) => updateVariant(idx, "value", e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-300 dark:text-slate-500 ml-1">
                  Ajuste Precio (+/-)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 text-[10px]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-6 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                    value={v.price_adjustment}
                    onChange={(e) =>
                      updateVariant(idx, "price_adjustment", e.target.value)
                    }
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-300 dark:text-slate-500 ml-1">
                    Ajuste Stock
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                    value={v.stock_adjustment}
                    onChange={(e) =>
                      updateVariant(idx, "stock_adjustment", e.target.value)
                    }
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formData.variants.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">
          <ArrowUpRight size={14} />
          <span>
            Tip: Usa los ajustes de precio para variantes que valen más o menos
            que el precio base.
          </span>
        </div>
      )}
    </div>
  );
};

export default VariantManager;
