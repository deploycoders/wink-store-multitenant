"use client";

import { AlignLeft, Type } from "lucide-react";

export default function EditorialSectionSettings({
  icon,
  title,
  description,
  value,
  onChange,
  inputClassName,
  labelClassName,
}) {
  const handleFieldChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {title}
          </h4>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {description}
          </p>
        </div>
      </div>

      <div>
        <label className={labelClassName}>
          <Type size={10} /> Título
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className={inputClassName}
          placeholder="Título principal"
        />
      </div>

      <div>
        <label className={labelClassName}>
          <AlignLeft size={10} /> Descripción
        </label>
        <textarea
          value={value.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className={`${inputClassName} h-28 py-4 resize-none`}
          placeholder="Texto descriptivo"
        />
      </div>
    </div>
  );
}
