"use client";

import Image from "next/image";
import { AlignLeft, Image as ImageIcon, Sparkles, Type, Upload } from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { inputClassName, labelClassName, sectionClassName } from "./siteSettingsStyles";

export default function PromoDividerSettings({
  value,
  onChange,
  onImageUpload,
  uploading,
}) {
  const handleFieldChange = (field, nextValue) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Sparkles size={22} />}
        title="Promo Divider"
        description="Controla el bloque promocional entre secciones"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
          <div>
            <label className={labelClassName}>
              <AlignLeft size={10} /> Eyebrow
            </label>
            <input
              type="text"
              value={value.eyebrow}
              onChange={(e) => handleFieldChange("eyebrow", e.target.value)}
              className={inputClassName}
              placeholder="Archive 2026"
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Type size={10} /> Titulo principal
            </label>
            <input
              type="text"
              value={value.title_primary}
              onChange={(e) => handleFieldChange("title_primary", e.target.value)}
              className={inputClassName}
              placeholder="The New"
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Type size={10} /> Titulo secundario
            </label>
            <input
              type="text"
              value={value.title_secondary}
              onChange={(e) => handleFieldChange("title_secondary", e.target.value)}
              className={inputClassName}
              placeholder="Standard"
            />
          </div>

          <div>
            <label className={labelClassName}>
              <AlignLeft size={10} /> Descripcion
            </label>
            <textarea
              value={value.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className={`${inputClassName} h-24 py-4 resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>
                <Type size={10} /> Boton CTA
              </label>
              <input
                type="text"
                value={value.cta_label}
                onChange={(e) => handleFieldChange("cta_label", e.target.value)}
                className={inputClassName}
                placeholder="Explorar Seleccion"
              />
            </div>

            <div>
              <label className={labelClassName}>
                <AlignLeft size={10} /> Footer
              </label>
              <input
                type="text"
                value={value.footer_text}
                onChange={(e) => handleFieldChange("footer_text", e.target.value)}
                className={inputClassName}
                placeholder="Minimal Aesthetics — Edition 001"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-4">
          <label className={labelClassName}>
            <ImageIcon size={10} /> Imagen del bloque
          </label>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <Image
              src={value.image}
              alt="Promo divider preview"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <label className="bg-white text-slate-900 px-4 py-2 rounded-full text-[10px] font-black tracking-widest cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                <Upload size={12} />
                {uploading ? "SUBIENDO..." : "CAMBIAR IMAGEN"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploading}
                  onChange={onImageUpload}
                />
              </label>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Recomendado: 1920x1080 para mantener el encuadre y el parallax.
          </p>
        </div>
      </div>
    </section>
  );
}
