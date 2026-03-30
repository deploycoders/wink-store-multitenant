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
        if (!response.ok || !result.success) throw new Error("Error cargando categorias");

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
    const nextSlots = [...slots];
    nextSlots[index] = nextValue;
    onHeaderMenuChange(nextSlots);
  };

  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Menu size={22} />}
        title="Menu Principal"
        description="Configura las 2 opciones del header junto a Colecciones"
      />

      {loadingCategories ? (
        <div className="h-48 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Cargando categorias...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {slots.map((slot, index) => (
              <HeaderMenuSlotCard
                key={slot.id || `slot-${index + 1}`}
                slot={slot}
                index={index}
                options={categoryOptions}
                onChange={handleSlotChange}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Navigation size={12} />
            El tercer item del menu siempre sera Colecciones.
          </div>
        </div>
      )}
    </section>
  );
}
