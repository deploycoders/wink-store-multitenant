"use client";

import { Link as LinkIcon, Tag, Type } from "lucide-react";
import { inputClassName, labelClassName } from "./siteSettingsStyles";

export default function HeaderMenuSlotCard({
  slot,
  index,
  options,
  onChange,
}) {
  const selectedValue =
    slot.target_id && slot.target_type
      ? `${slot.target_type}:${slot.target_id}`
      : "none";

  const handleTargetChange = (value) => {
    if (value === "none") {
      onChange(index, {
        ...slot,
        target_type: "category",
        target_id: null,
      });
      return;
    }

    const [targetType, targetId] = value.split(":");
    onChange(index, {
      ...slot,
      target_type: targetType,
      target_id: targetId,
    });
  };

  return (
    <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-4">
      <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 h-8 rounded-full text-[10px] font-black uppercase tracking-widest">
        Slot 0{index + 1}
      </div>

      <div>
        <label className={labelClassName}>
          <Type size={10} /> Etiqueta del Menu
        </label>
        <input
          type="text"
          value={slot.label}
          onChange={(e) =>
            onChange(index, {
              ...slot,
              label: e.target.value,
            })
          }
          className={inputClassName}
          placeholder={`Opcion ${index + 1}`}
        />
      </div>

      <div>
        <label className={labelClassName}>
          <LinkIcon size={10} /> Enlace del Filtro
        </label>
        <select
          value={selectedValue}
          onChange={(e) => handleTargetChange(e.target.value)}
          className={inputClassName}
        >
          <option value="none">Sin filtro (solo /products)</option>
          {options.map((option) => (
            <option
              key={`${option.target_type}:${option.id}`}
              value={`${option.target_type}:${option.id}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        <Tag size={12} />
        {selectedValue === "none"
          ? "Destino: Colecciones completas"
          : `Destino: ${slot.target_type}`}
      </div>
    </div>
  );
}
