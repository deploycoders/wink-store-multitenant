"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Tag, Type, Link as LinkIcon, Loader2 } from "lucide-react";

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

export default function CategoryForm({
  initialData = null,
  parentCategories = [],
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    parent_ids:
      initialData?.parent_ids ||
      (initialData?.parent_id ? [initialData.parent_id] : []),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_ids: form.parent_ids || [],
        image_url: null,
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

      <div className="space-y-6">
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

        <div>
          <label className={labelClass}>
            <Tag size={12} /> Categorías Padre
          </label>
          <div className="space-y-3 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 bg-slate-50/60 dark:bg-slate-800/40">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <input
                type="checkbox"
                checked={form.parent_ids.length === 0}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parent_ids: e.target.checked ? [] : prev.parent_ids,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Categoría principal (sin padres)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {parentCategories
                .filter((c) => !initialData || c.id !== initialData.id)
                .map((cat) => {
                  const checked = form.parent_ids.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            parent_ids: e.target.checked
                              ? [
                                  ...new Set([
                                    ...(prev.parent_ids || []),
                                    cat.id,
                                  ]),
                                ]
                              : (prev.parent_ids || []).filter(
                                  (id) => id !== cat.id,
                                ),
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      {cat.name}
                    </label>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

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
          disabled={loading}
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
