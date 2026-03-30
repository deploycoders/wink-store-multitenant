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
import EditorialContentSettings from "./EditorialContentSettings";
import HeroSliderSettings from "./HeroSliderSettings";
import SiteIdentitySettings from "./SiteIdentitySettings";
import SiteSettingsFooter from "./SiteSettingsFooter";
import HeaderMenuSettings from "./HeaderMenuSettings";
import PromoDividerSettings from "./PromoDividerSettings";
import FooterSettings from "./FooterSettings";
import CommerceSettings from "./CommerceSettings";

const hasValueChanged = (currentValue, nextValue) =>
  JSON.stringify(currentValue) !== JSON.stringify(nextValue);

export default function SiteSettingsManager() {
  const {
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
  const [slides, setSlides] = useState(currentSlides || []);
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
    setSlides(currentSlides);
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
    formData.append("folder", "hero_sections");

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
    formData.append("folder", "promo_divider");

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
      setStatus({ type: "error", message: "Error al subir imagen del promo divider" });
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
      await updateSiteConfig({
        site_name: siteName,
        hero_slides: slides,
        home_intro: homeIntro,
        products_intro: productsIntro,
        header_menu: headerMenu,
        promo_divider: promoDivider,
        footer_settings: footerSettings,
        commerce_settings: commerceSettings,
      });

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
          promo_divider_title: `${promoDivider.title_primary} ${promoDivider.title_secondary}`.trim(),
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

  return (
    <div className="space-y-10">
      <SiteIdentitySettings
        siteName={siteName}
        onSiteNameChange={setSiteName}
      />

      <HeaderMenuSettings
        headerMenu={headerMenu}
        onHeaderMenuChange={setHeaderMenu}
      />

      <HeroSliderSettings
        slides={slides}
        onAddSlide={handleAddSlide}
        onRemoveSlide={handleRemoveSlide}
        onUpdateSlide={handleUpdateSlide}
        onImageUpload={handleImageUpload}
      />

      <EditorialContentSettings
        homeIntro={homeIntro}
        onHomeIntroChange={setHomeIntro}
        productsIntro={productsIntro}
        onProductsIntroChange={setProductsIntro}
      />

      <PromoDividerSettings
        value={promoDivider}
        onChange={setPromoDivider}
        onImageUpload={handlePromoImageUpload}
        uploading={uploading}
      />

      <FooterSettings value={footerSettings} onChange={setFooterSettings} />

      <CommerceSettings
        value={commerceSettings}
        onChange={setCommerceSettings}
      />

      <SiteSettingsFooter
        loading={loading}
        uploading={uploading}
        status={status}
        onSave={handleSave}
      />
    </div>
  );
}
