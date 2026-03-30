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
        <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase italic tracking-tight">
          Este nombre aparecerá en el Header, Footer y correos del sistema.
        </p>
      </div>
    </section>
  );
}
