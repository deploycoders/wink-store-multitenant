"use client";

import { Type } from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import {
  inputClassName,
  labelClassName,
  sectionClassName,
} from "./siteSettingsStyles";

export default function SiteIdentitySettings({ siteName, onSiteNameChange }) {
  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Type size={22} />}
        title="Identidad Visual"
        description="Nombre global de la plataforma"
      />

      <div className="max-w-md">
        <label className={labelClassName}>Nombre de la Tienda</label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => onSiteNameChange(e.target.value)}
          className={inputClassName}
          placeholder="Ej: WINKSTORE"
        />
        <div className="w-full rounded-md border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          Este nombre aparecerá en la tienda principal (Header, Footer y
          notificaciones incluidas).
        </div>
      </div>
    </section>
  );
}
