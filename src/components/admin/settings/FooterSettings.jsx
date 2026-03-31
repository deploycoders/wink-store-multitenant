"use client";

import {
  AlertTriangle,
  Facebook,
  Instagram,
  Twitter,
  Type,
} from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import {
  inputClassName,
  labelClassName,
  sectionClassName,
} from "./siteSettingsStyles";

export default function FooterSettings({ value, onChange }) {
  const handleFieldChange = (field, nextValue) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Type size={22} />}
        title="Footer"
        description="Edita descripcion y redes sociales del pie de pagina"
      />

      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Descripcion principal</label>
          <textarea
            value={value.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={`${inputClassName} h-24 py-4 resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClassName}>
              <Instagram size={10} /> Instagram URL
            </label>
            <input
              type="url"
              value={value.instagram_url}
              onChange={(e) =>
                handleFieldChange("instagram_url", e.target.value)
              }
              className={inputClassName}
              placeholder="https://instagram.com/tu-cuenta"
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Facebook size={10} /> Facebook URL
            </label>
            <input
              type="url"
              value={value.facebook_url}
              onChange={(e) =>
                handleFieldChange("facebook_url", e.target.value)
              }
              className={inputClassName}
              placeholder="https://facebook.com/tu-cuenta"
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Twitter size={10} /> X / Twitter URL
            </label>
            <input
              type="url"
              value={value.twitter_url}
              onChange={(e) => handleFieldChange("twitter_url", e.target.value)}
              className={inputClassName}
              placeholder="https://x.com/tu-cuenta"
            />
          </div>
        </div>
        <div className="flex items-start gap-2 mt-6 px-1 opacity-80">
          <AlertTriangle className="text-amber-500 w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Las URLs que estén vacías{" "}
            <span className="font-medium">no se mostrarán</span> en el pie de
            página de tu tienda.
          </p>
        </div>
      </div>
    </section>
  );
}
