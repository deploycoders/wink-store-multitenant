"use client";

import { Type } from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import {
  inputClassName,
  labelClassName,
  sectionClassName,
} from "./siteSettingsStyles";

export default function SiteIdentitySettings({ 
  siteName, 
  onSiteNameChange,
  tenantSlug,
  nameChangeLimitReached,
  changesLeft,
  isLoading
}) {
  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Type size={22} />}
        title="Identidad Visual"
        description="Nombre global y URL de tu tienda"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-4">
          <label className={labelClassName}>Nombre de la Tienda</label>
          <input
            type="text"
            value={isLoading ? "Cargando nombre..." : (siteName || "")}
            onChange={(e) => onSiteNameChange(e.target.value)}
            disabled={nameChangeLimitReached || isLoading}
            className={`${inputClassName} ${
              (nameChangeLimitReached || isLoading) ? 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' : ''
            } ${isLoading ? 'animate-pulse text-slate-400' : ''}`}
            placeholder="Ej: WINKSTORE"
          />
          {isLoading ? (
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider animate-pulse">
              Consultando base de datos...
            </p>
          ) : nameChangeLimitReached ? (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Límite de cambios alcanzado (0/3 este mes)
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Este nombre aparecerá en el Header, Footer y correos.
              </p>
              <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                changesLeft === 1 ? "text-amber-500" : "text-blue-500"
              }`}>
                {changesLeft === 1 
                  ? "⚠️ Último cambio disponible este mes" 
                  : `✓ Te quedan ${changesLeft} cambios este mes`}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className={labelClassName}>Identificador de URL (Slug)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">/</span>
            <input
              type="text"
              value={isLoading ? "Obteniendo URL..." : (tenantSlug || "")}
              readOnly
              className={`${inputClassName} pl-8 font-mono text-xs bg-slate-50/50 dark:bg-slate-800/20 cursor-not-allowed opacity-70 ${
                isLoading ? 'animate-pulse text-slate-400' : ''
              }`}
              placeholder="mi-tienda-ideal"
            />
          </div>
          <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">
            ⚠️ ¡CUIDADO! Cambiar esto romperá todos tus enlaces compartidos.
          </p>
        </div>
      </div>
    </section>
  );
}
