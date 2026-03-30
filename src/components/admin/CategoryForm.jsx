"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  ChevronDown, 
  Image as ImageIcon, 
  Tag, 
  Type, 
  Link as LinkIcon,
  Loader2,
  Upload,
  Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CLOUDINARY_CONFIG } from "./product-form/config";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöôõ]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function CategoryForm({ initialData = null, parentCategories = [], onSuccess, onCancel }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    parent_id: initialData?.parent_id || "",
    image_url: initialData?.image_url || "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      name: value,
      slug: generateSlug(value)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", "categories");

    try {
      const res = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir a Cloudinary");

      const data = await res.json();
      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
    } catch (err) {
      console.error("Cloudinary error:", err);
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id || null,
        image_url: form.image_url || null,
      };

      const url = isEditing
        ? `/api/categories/${initialData.id}`
        : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Error al guardar la categoría");
      }

      if (onSuccess) {
        onSuccess(result.data);
      } else {
        router.push("/admin/categories");
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-14 w-full px-6 rounded-2xl border border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-bold text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm";
  const labelClass =
    "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 mb-2 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-tight flex items-center gap-3">
          <X size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Info básica */}
        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className={labelClass}>
              <Type size={12} /> Nombre de la Categoría
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Ej: Hombre, Franelas..."
              className={inputClass}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>
              <LinkIcon size={12} /> URL (Slug)
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              readOnly
              disabled
              className={`${inputClass} bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 cursor-not-allowed border-dashed`}
            />
          </div>

          {/* Categoría Padre */}
          <div>
            <label className={labelClass}>
              <Tag size={12} /> Tipo de Categoría
            </label>
            <div className="relative">
              <select
                name="parent_id"
                value={form.parent_id}
                onChange={(e) => setForm(prev => ({ ...prev, parent_id: e.target.value }))}
                className={`${inputClass} appearance-none pr-12`}
              >
                <option value="">RAÍZ (Categoría Principal)</option>
                {parentCategories
                  .filter((c) => !initialData || c.id !== initialData.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      SUB DE: {cat.name.toUpperCase()}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Imagen */}
        <div className="space-y-6">
          <label className={labelClass}>
            <ImageIcon size={12} /> Imagen de Portada
          </label>
          
          <div className="relative aspect-square w-full max-w-[200px] mx-auto group">
            <div className="w-full h-full rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600">
              {form.image_url ? (
                <>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-200 dark:text-slate-800" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-4">
                        Subir Foto
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            {!uploading && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight">
            Se recomienda una imagen cuadrada 1:1
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 h-12 rounded-2xl text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 h-14 rounded-2xl hover:bg-black dark:hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 dark:shadow-none flex items-center gap-3 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {isEditing ? "ACTUALIZAR" : "CREAR CATEGORÍA"}
        </button>
      </div>
    </form>
  );
}

