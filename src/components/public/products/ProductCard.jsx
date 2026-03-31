"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuickAddSheet from "@/components/public/products/QuickAddSheet";
import { getOptimizedImage } from "@/lib/getOptimizedImage";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";
import AdaptiveImage from "@/components/ui/AdaptiveImage";

export default function ProductCard({ product }) {
  const { site_name, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;
  // CORRECCIÓN: Usamos 'name' y 'description' (o short_description si la creaste)
  // según la estructura de tu tabla en Supabase
  const { name, price, discount_price, description, category, slug, images } =
    product;
  const regularPrice = Number(price) || 0;
  const offerPrice = Number(discount_price) || 0;
  const hasActiveOffer = offerPrice > 0 && offerPrice < regularPrice;
  const displayPrice = hasActiveOffer ? offerPrice : regularPrice;

  // En Supabase guardas un array de strings, por lo que images[0] es directamente la URL
  const rawImageUrl = images?.[0] || "/placeholder.jpg";
  const imageUrl = getOptimizedImage(rawImageUrl, 400);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSheetOpen(true);
  };

  return (
    <div className="group block relative">
      <Link href={`${baseUrl}/products/${slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-[#F9F9F9] aspect-3/4">
          {category?.name && (
            <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm">
              {category.name}
            </span>
          )}

          <AdaptiveImage
            src={imageUrl}
            alt={name || `Producto de ${brand}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="mt-4 space-y-1 px-1">
          <div className="flex justify-between items-start">
            <h4 className="text-[13px] font-semibold text-ink uppercase tracking-tight">
              {name} {/* Corregido: 'name' en lugar de 'title' */}
            </h4>
            <div className="flex flex-col items-end leading-tight">
              {hasActiveOffer && (
                <span className="text-[10px] font-semibold text-red-500 line-through">
                  ${regularPrice.toFixed(2)}
                </span>
              )}
              <span className="text-[14px] font-bold text-black">
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-1 font-light italic">
            {description || "Minimalist essential piece"}
          </p>
        </div>
      </Link>

      <Button
        onClick={handleQuickAdd}
        size="icon"
        className="absolute bottom-21 cursor-pointer right-4 z-20 bg-white text-ink hover:bg-ink hover:text-white shadow-xl transition-all duration-200 active:scale-95"
        aria-label={`Añadir ${name} al carrito`}
      >
        <Plus size={18} />
      </Button>

      <QuickAddSheet
        product={product}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
