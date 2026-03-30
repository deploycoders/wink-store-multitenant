"use client";
import SectionIntro from "@/components/public/SectionIntro";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_PRODUCTS_INTRO } from "@/lib/siteConfig";

export default function AnimatedHeaderProducts() {
  const { products_intro } = useSiteConfig();
  const intro = { ...DEFAULT_PRODUCTS_INTRO, ...(products_intro || {}) };

  return (
    <SectionIntro
      title={intro.title}
      description={intro.description}
      className="mb-24"
      headingClassName="text-3xl md:text-5xl"
      lineClassName="w-16"
      descriptionClassName="max-w-2xl"
      animate
    />
  );
}
