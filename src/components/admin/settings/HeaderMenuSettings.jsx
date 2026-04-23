"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Menu, Navigation } from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import HeaderMenuSlotCard from "./HeaderMenuSlotCard";
import { sectionClassName } from "./siteSettingsStyles";

export default function HeaderMenuSettings({ headerMenu, onHeaderMenuChange }) {
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error("Error cargando categorias");

        const options = [];
        (result.data || []).forEach((category) => {
          options.push({
            id: category.id,
            label: `Categoria: ${category.name}`,
            target_type: "category",
          });

          (category.subcategories || []).forEach((subcategory) => {
            options.push({
              id: subcategory.id,
              label: `Subcategoria: ${subcategory.name} (${category.name})`,
              target_type: "subcategory",
            });
          });
        });

        setCategoryOptions(options);
      } catch (error) {
        console.error(error);
        setCategoryOptions([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const slots = useMemo(() => {
    if (Array.isArray(headerMenu) && headerMenu.length >= 2) {
      return headerMenu.slice(0, 2);
    }
    return [];
  }, [headerMenu]);

  const handleSlotChange = (index, nextValue) => {
    const nextMenu = [...(headerMenu || [])];
    nextMenu[index] = nextValue;
    onHeaderMenuChange(nextMenu);
  };

  const handleAddSlot = () => {
    const nextMenu = [...(headerMenu || [])];
    nextMenu.push({
      id: `slot-${Date.now()}`,
      label: "Nuevo Enlace",
      target_type: "category",
      target_id: null,
    });
    onHeaderMenuChange(nextMenu);
  };

  const handleRemoveSlot = (index) => {
    const nextMenu = headerMenu.filter((_, i) => i !== index);
    onHeaderMenuChange(nextMenu);
  };

  return (
    <section className={sectionClassName}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <SettingsSectionHeader
          icon={<Menu size={30} />}
          title="Menú Principal"
          description="Configura los enlaces directos que aparecerán en el encabezado de tu tienda."
        />
        <button
          type="button"
          onClick={handleAddSlot}
          className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          Añadir Enlace
        </button>
      </div>

      {loadingCategories ? (
        <div className="h-48 rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Cargando categorías...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {headerMenu.length === 0 ? (
            <div className="h-32 rounded-md border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 italic text-xs">
              <Navigation size={20} className="mb-2 opacity-20" />
              Tu menú está vacío. Añade un enlace para empezar.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {headerMenu.map((slot, index) => (
                <div
                  key={slot.id || `slot-${index}`}
                  className="relative group"
                >
                  <HeaderMenuSlotCard
                    slot={slot}
                    index={index}
                    options={categoryOptions}
                    onChange={handleSlotChange}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 text-red-500 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-red-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="Eliminar enlace"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-md border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Navigation size={12} />
            Tip: Vincula tus enlaces a categorías para que los clientes lleguen
            más rápido a tus productos.
          </div>
        </div>
      )}
    </section>
  );
}
