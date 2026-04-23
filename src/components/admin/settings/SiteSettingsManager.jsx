"use client";

import React, { useEffect, useState } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { logAudit } from "@/lib/auditLog";
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_HEADER_MENU,
  DEFAULT_HOME_INTRO,
  DEFAULT_PROMO_DIVIDER,
  DEFAULT_PRODUCTS_INTRO,
  normalizeCommerceSettings,
  normalizeFooterSettings,
  normalizeHeaderMenu,
  normalizePromoDivider,
  updateSiteConfig,
} from "@/lib/siteConfig";
import { createClient } from "@/lib/supabase/client";
import { CLOUDINARY_CONFIG } from "../product-form/config";
import { buildTenantCloudinaryFolder } from "@/lib/cloudinaryFolders";
import EditorialContentSettings from "./EditorialContentSettings";
import HeroSliderSettings from "./HeroSliderSettings";
import SiteIdentitySettings from "./SiteIdentitySettings";
import SiteSettingsFooter from "./SiteSettingsFooter";
import HeaderMenuSettings from "./HeaderMenuSettings";
import PromoDividerSettings from "./PromoDividerSettings";
import FooterSettings from "./FooterSettings";
import CommerceSettings from "./CommerceSettings";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Loader2, Save } from "lucide-react";

const hasValueChanged = (currentValue, nextValue) =>
  JSON.stringify(currentValue) !== JSON.stringify(nextValue);

const normalizeSlides = (value) => (Array.isArray(value) ? value : []);

export default function SiteSettingsManager() {
  const {
    tenant_id: tenantId,
    tenant_slug: tenantSlug,
    site_name: currentName,
    hero_slides: currentSlides,
    home_intro: currentHomeIntro,
    products_intro: currentProductsIntro,
    header_menu: currentHeaderMenu,
    promo_divider: currentPromoDivider,
    footer_settings: currentFooterSettings,
    commerce_settings: currentCommerceSettings,
    refresh,
  } = useSiteConfig();
  const supabase = createClient();

  const [siteName, setSiteName] = useState(currentName || "");
  const [slides, setSlides] = useState(normalizeSlides(currentSlides));
  const [homeIntro, setHomeIntro] = useState(DEFAULT_HOME_INTRO);
  const [productsIntro, setProductsIntro] = useState(DEFAULT_PRODUCTS_INTRO);
  const [headerMenu, setHeaderMenu] = useState(DEFAULT_HEADER_MENU);
  const [promoDivider, setPromoDivider] = useState(DEFAULT_PROMO_DIVIDER);
  const [footerSettings, setFooterSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [commerceSettings, setCommerceSettings] = useState(
    DEFAULT_COMMERCE_SETTINGS,
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [actorName, setActorName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setSiteName(currentName);
    setSlides(normalizeSlides(currentSlides));
    setHomeIntro({ ...DEFAULT_HOME_INTRO, ...(currentHomeIntro || {}) });
    setProductsIntro({
      ...DEFAULT_PRODUCTS_INTRO,
      ...(currentProductsIntro || {}),
    });
    setHeaderMenu(normalizeHeaderMenu(currentHeaderMenu));
    setPromoDivider(normalizePromoDivider(currentPromoDivider));
    setFooterSettings(normalizeFooterSettings(currentFooterSettings));
    setCommerceSettings(normalizeCommerceSettings(currentCommerceSettings));
  }, [
    currentName,
    currentSlides,
    currentHomeIntro,
    currentProductsIntro,
    currentHeaderMenu,
    currentPromoDivider,
    currentFooterSettings,
    currentCommerceSettings,
  ]);

  useEffect(() => {
    const loadActor = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUser(user);

      const { data: profile } = await supabase
        .from("staff_profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setActorName(profile?.full_name || user.email || "Admin");
    };

    loadActor();
  }, [supabase]);

  const handleAddSlide = () => {
    if (slides.length >= 3) return;

    const newSlide = {
      id: Date.now(),
      subtitle: "- Nueva Colección",
      title: "Título del Slide",
      description: "Descripción breve del slide aquí.",
      image: "/banner-clothes.jpg",
    };

    setSlides((prev) => [...prev, newSlide]);
  };

  const handleRemoveSlide = (id) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((slide) => slide.id !== id));
  };

  const handleUpdateSlide = (id, field, value) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  const handleImageUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    handleUpdateSlide(id, "image", localPreviewUrl);

    setUploading(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append(
      "folder",
      buildTenantCloudinaryFolder({
        tenantSlug,
        tenantId,
        area: "site",
        subpath: "hero",
      }),
    );

    try {
      const res = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();
      const optimizedUrl = data.secure_url.replace(
        "/upload/",
        "/upload/w_800,q_auto,f_auto/",
      );

      handleUpdateSlide(id, "image", optimizedUrl);
      URL.revokeObjectURL(localPreviewUrl);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Error al subir la imagen" });
    } finally {
      setUploading(false);
    }
  };

  const handlePromoImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setPromoDivider((prev) => ({ ...prev, image: localPreviewUrl }));

    setUploading(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append(
      "folder",
      buildTenantCloudinaryFolder({
        tenantSlug,
        tenantId,
        area: "site",
        subpath: "promo-divider",
      }),
    );

    try {
      const res = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen del promo divider");

      const data = await res.json();
      const optimizedUrl = data.secure_url.replace(
        "/upload/",
        "/upload/w_1600,q_auto,f_auto/",
      );

      setPromoDivider((prev) => ({ ...prev, image: optimizedUrl }));
      URL.revokeObjectURL(localPreviewUrl);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Error al subir imagen del promo divider",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    const changeMap = {
      site_name: hasValueChanged(currentName, siteName),
      hero_slides: hasValueChanged(currentSlides, slides),
      home_intro: hasValueChanged(currentHomeIntro, homeIntro),
      products_intro: hasValueChanged(currentProductsIntro, productsIntro),
      header_menu: hasValueChanged(currentHeaderMenu, headerMenu),
      promo_divider: hasValueChanged(currentPromoDivider, promoDivider),
      footer_settings: hasValueChanged(currentFooterSettings, footerSettings),
      commerce_settings: hasValueChanged(
        currentCommerceSettings,
        commerceSettings,
      ),
    };

    const changedSections = Object.entries(changeMap)
      .filter(([, changed]) => changed)
      .map(([key]) => key);

    try {
      await updateSiteConfig(
        {
          site_name: siteName,
          hero_slides: slides,
          home_intro: homeIntro,
          products_intro: productsIntro,
          header_menu: headerMenu,
          promo_divider: promoDivider,
          footer_settings: footerSettings,
          commerce_settings: commerceSettings,
        },
        { tenantId },
      );

      await logAudit(supabase, {
        tipo: "ajuste",
        accion: "editar",
        descripcion:
          changedSections.length > 0
            ? `Configuración web actualizada: ${changedSections.join(", ")}`
            : "Configuración web guardada sin cambios detectados",
        usuario_id: currentUser?.id ?? null,
        usuario_nombre: actorName,
        meta: {
          changed_sections: changedSections,
          site_name: siteName,
          hero_slides_count: slides.length,
          home_intro_title: homeIntro.title,
          products_intro_title: productsIntro.title,
          header_menu,
          promo_divider_title:
            `${promoDivider.title_primary} ${promoDivider.title_secondary}`.trim(),
          footer_description: footerSettings.description,
          commerce_settings: {
            whatsapp_number: commerceSettings.whatsapp_number,
            payment_methods: commerceSettings.payment_methods,
          },
        },
      });

      setStatus({
        type: "success",
        message: "Configuración guardada correctamente",
      });
      refresh();
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (err) {
      console.error("DETALLE DEL ERROR:", {
        message: err.message,
        stack: err.stack,
        errorCompleto: err,
      });

      setStatus({
        type: "error",
        message: err.message || "Error al guardar la configuración",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPayloadForSection = (section) => {
    switch (section) {
      case "general":
        return { site_name: siteName, header_menu: headerMenu };
      case "home":
        return {
          hero_slides: slides,
          home_intro: homeIntro,
          products_intro: productsIntro,
          promo_divider: promoDivider,
        };
      case "footer":
        return {
          footer_settings: footerSettings,
          commerce_settings: commerceSettings,
        };
      default:
        return {};
    }
  };

  const handleSaveSection = async (section) => {
    const payload = getPayloadForSection(section);
    if (!Object.keys(payload).length) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await updateSiteConfig(payload, { tenantId });
      await logAudit(supabase, {
        tipo: "ajuste",
        accion: "editar",
        descripcion: `Sección ${section} guardada`,
        usuario_id: currentUser?.id ?? null,
        usuario_nombre: actorName,
        meta: {
          section: section,
          payload,
        },
      });

      setStatus({
        type: "success",
        message: `Sección ${section} guardada correctamente`,
      });
      refresh();
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (err) {
      console.error("DETALLE DEL ERROR:", {
        message: err.message,
        stack: err.stack,
        errorCompleto: err,
      });
      setStatus({
        type: "error",
        message: err.message || "Error al guardar sección",
      });
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Identidad y Navegación" },
    { id: "home", label: "Contenido y Home" },
    { id: "footer", label: "Footer y Comercio" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Configuración Web
        </h2>

        {/* Navegación por Pestañas Horizontal */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-md w-fit max-w-full overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 sm:px-6 py-2 sm:py-2.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de las Secciones */}
      <div className="bg-white dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800 p-4 sm:p-8 shadow-sm">
        {activeTab === "general" && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">
                Identidad Visual
              </h3>
              <SiteIdentitySettings
                siteName={siteName}
                onSiteNameChange={setSiteName}
              />
            </div>

            <div className="h-px bg-slate-50 dark:bg-slate-800" />

            <div className="space-y-6">
              <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">
                Menú de Navegación
              </h3>
              <HeaderMenuSettings
                headerMenu={headerMenu}
                onHeaderMenuChange={setHeaderMenu}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleSaveSection("general")}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 sm:px-8 h-12 rounded-md hover:bg-slate-700 dark:hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Save size={18} />
                Guardar Identidad
              </button>
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <HeroSliderSettings
              slides={slides}
              onAddSlide={handleAddSlide}
              onRemoveSlide={handleRemoveSlide}
              onUpdateSlide={handleUpdateSlide}
              onImageUpload={handleImageUpload}
            />

            <div className="h-px bg-slate-50 dark:bg-slate-800" />

            <EditorialContentSettings
              homeIntro={homeIntro}
              onHomeIntroChange={setHomeIntro}
              productsIntro={productsIntro}
              onProductsIntroChange={setProductsIntro}
            />

            <div className="h-px bg-slate-50 dark:bg-slate-800" />

            <PromoDividerSettings
              value={promoDivider}
              onChange={setPromoDivider}
              onImageUpload={handlePromoImageUpload}
              uploading={uploading}
            />

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleSaveSection("home")}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 sm:px-8 h-12 rounded-md hover:bg-slate-700 dark:hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Save size={18} />
                Guardar Contenido
              </button>
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">
                Información del Pie de Página
              </h3>
              <FooterSettings
                value={footerSettings}
                onChange={setFooterSettings}
              />
            </div>

            <div className="h-px bg-slate-50 dark:bg-slate-800" />

            <div className="space-y-6">
              <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">
                Configuración Comercial
              </h3>
              <CommerceSettings
                value={commerceSettings}
                onChange={setCommerceSettings}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => handleSaveSection("footer")}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 sm:px-8 h-12 rounded-md hover:bg-slate-700 dark:hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Save size={18} />
                Guardar Comercio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
