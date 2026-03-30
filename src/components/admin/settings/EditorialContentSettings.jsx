"use client";

import { AlignLeft, Image as ImageIcon, Type } from "lucide-react";
import EditorialSectionSettings from "./EditorialSectionSettings";
import SettingsSectionHeader from "./SettingsSectionHeader";
import {
  inputClassName,
  labelClassName,
  sectionClassName,
} from "./siteSettingsStyles";

export default function EditorialContentSettings({
  homeIntro,
  onHomeIntroChange,
  productsIntro,
  onProductsIntroChange,
}) {
  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<AlignLeft size={22} />}
        title="Textos Editoriales"
        description="Ajusta los bloques de contenido de Home y Catálogo"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <EditorialSectionSettings
          icon={<Type size={18} />}
          title="Home"
          description="Bloque superior de productos en la página principal"
          value={homeIntro}
          onChange={onHomeIntroChange}
          inputClassName={inputClassName}
          labelClassName={labelClassName}
        />

        <EditorialSectionSettings
          icon={<ImageIcon size={18} />}
          title="Página /products"
          description="Encabezado principal del catálogo completo"
          value={productsIntro}
          onChange={onProductsIntroChange}
          inputClassName={inputClassName}
          labelClassName={labelClassName}
        />
      </div>
    </section>
  );
}
