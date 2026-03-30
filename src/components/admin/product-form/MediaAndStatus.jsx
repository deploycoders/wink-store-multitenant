import React from "react";
import {
  Upload,
  Loader2,
  Trash2,
  Tag,
  Layers,
  Share2,
  Star,
} from "lucide-react";
import { CLOUDINARY_CONFIG } from "./config";

const MediaAndStatus = ({
  formData,
  setFormData,
  categories,
  subcategories,
  uploading,
  handleImageUpload,
  removeImage,
  handleCategoryChange,
  readOnly = false,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
      {/* Galería de Fotos */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
          <Upload size={12} /> Galería de Fotos
        </label>
        <div className="grid grid-cols-3 gap-3">
          {formData.images.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt={`Product ${idx}`}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <label
              className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-slate-400" />
              ) : (
                <>
                  <Upload size={18} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">
                    Añadir
                  </span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Categorización */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] space-y-4 border border-slate-100 dark:border-slate-700/50">
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Tag size={12} /> Categorías (Multi-selección)
          </label>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => {
                const isSelected = formData.category_ids?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => !readOnly && handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none scale-105"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"
                    } ${readOnly ? "cursor-default opacity-80" : "cursor-pointer"}`}
                  >
                    {cat.name}
                  </button>
                );
              })
            ) : (
              <p className="text-[10px] text-slate-400 italic py-2">
                No hay categorías principales cargadas...
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Layers size={12} /> Subcategoría
          </label>
          <select
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all outline-none"
            value={formData.subcategory_id}
            onChange={(e) =>
              setFormData({ ...formData, subcategory_id: e.target.value })
            }
            disabled={readOnly}
          >
            <option value="">NINGUNA</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estado y Destacado */}
      <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] space-y-6 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-transparent dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">
              Visibilidad
            </span>
            <div className={`flex bg-slate-800 dark:bg-slate-900/80 p-1 rounded-xl ${readOnly ? "opacity-50 pointer-events-none" : ""}`}>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-[9px] cursor-pointer font-black uppercase transition-all ${formData.status === "draft" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                onClick={() => !readOnly && setFormData({ ...formData, status: "draft" })}
              >
                Borrador
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-[9px] cursor-pointer font-black uppercase transition-all ${formData.status === "published" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                onClick={() =>
                  !readOnly && setFormData({ ...formData, status: "published" })
                }
              >
                Publicado
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              !readOnly && setFormData({ ...formData, featured: !formData.featured })
            }
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.featured ? "bg-amber-400 text-slate-900 rotate-12 scale-110" : "bg-slate-800 dark:bg-slate-900/80 text-white/20"} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          >
            <Star
              size={20}
              fill={formData.featured ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaAndStatus;
