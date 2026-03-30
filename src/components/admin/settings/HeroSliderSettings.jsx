"use client";

import { Image as ImageIcon, Plus } from "lucide-react";
import HeroSlideCard from "./HeroSlideCard";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { sectionClassName } from "./siteSettingsStyles";

export default function HeroSliderSettings({
  slides,
  onAddSlide,
  onRemoveSlide,
  onUpdateSlide,
  onImageUpload,
}) {
  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<ImageIcon size={22} />}
        title="Hero Slider"
        description="Gestiona los slides de la página de inicio"
        action={
          <button
            onClick={onAddSlide}
            disabled={slides.length >= 3}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 h-12 rounded-xl hover:bg-black dark:hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            <Plus size={16} /> AGREGAR SLIDE
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {slides.map((slide, index) => (
          <HeroSlideCard
            key={slide.id}
            slide={slide}
            index={index}
            totalSlides={slides.length}
            onRemove={onRemoveSlide}
            onUpdate={onUpdateSlide}
            onImageUpload={onImageUpload}
          />
        ))}
      </div>
    </section>
  );
}
