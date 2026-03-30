"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/useCartStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";

export default function QuickAddSheet({ product, open, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const addItem = useCartStore((state) => state.addItem);
  const { site_name, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;

  if (!product) return null;

  // Ajuste de campos según tu base de datos (Supabase)
  const {
    name,
    price,
    discount_price,
    short_description,
    images,
    product_variants,
    slug,
  } = product;
  const selectedVariant = (product_variants || []).find(
    (variant) => variant.value === selectedSize,
  );
  const regularPrice = Number(price) || 0;
  const offerPrice = Number(discount_price) || 0;
  const hasActiveOffer = offerPrice > 0 && offerPrice < regularPrice;
  const basePrice = hasActiveOffer ? offerPrice : regularPrice;
  const priceAdjustment = Number(selectedVariant?.price_adjustment) || 0;
  const finalPrice = basePrice + priceAdjustment;
  const finalRegularPrice = regularPrice + priceAdjustment;

  // Manejo de imagen desde el array de strings de Cloudinary
  const imageUrl = images?.[0] || "/placeholder.jpg";

  // Ajuste de variantes: usamos product_variants que es lo que viene de tu tabla
  const hasVariants = product_variants && product_variants.length > 0;

  const handleAddToCart = () => {
    if (hasVariants && !selectedSize) {
      Swal.fire({
        title: "¡Atención!",
        text: "Selecciona una talla para poder continuar.",
        icon: "warning",
        confirmButtonColor: "#1A1A1A",
        background: "#FBF9F6",
        color: "#1A1A1A",
      });
      return;
    }

    addItem(product, 1, selectedSize, selectedVariant);
    onClose();
    setSelectedSize(null);

    Swal.fire({
      icon: "success",
      title: "¡Añadido!",
      text: `${name} ha sido añadido al carrito.`,
      timer: 1500,
      showConfirmButton: false,
      background: "#FBF9F6",
      color: "#1A1A1A",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-6 pb-10 pt-8 max-w-lg mx-auto sm:rounded-t-3xl border-none"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="sr-only">Añadir {name} al carrito</SheetTitle>
          <SheetDescription className="sr-only">
            Selecciona talla y añade el producto al carrito
          </SheetDescription>
        </SheetHeader>

        {/* Vista previa del producto */}
        <div className="flex gap-5 mb-8">
          <div className="relative w-24 h-30 rounded-2xl overflow-hidden shrink-0 bg-secondary">
            <Image
              src={imageUrl}
              alt={`Imagen de ${name}`} // Corregido: alt property obligatoria
              fill
              priority // Añadido para mejorar el LCP (ya que es un popup de acción rápida)
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-honey-dark">
              {brand}
            </p>
            <h2 className="text-lg font-serif font-bold uppercase tracking-tight text-ink">
              {name || "Producto sin nombre"}
            </h2>
            <div className="flex items-end gap-2">
              {hasActiveOffer && (
                <p className="text-[11px] font-semibold text-red-500 line-through">
                  ${finalRegularPrice.toFixed(2)}
                </p>
              )}
              <p className="text-lg font-bold text-black">${finalPrice.toFixed(2)}</p>
            </div>
            {priceAdjustment > 0 && (
              <p className="text-[10px] text-amber-700 font-semibold">
                +${priceAdjustment.toFixed(2)} por{" "}
                {selectedVariant?.name?.toLowerCase() || "atributo"}.
              </p>
            )}
            {hasActiveOffer && (
              <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">
                Oferta activa
              </p>
            )}
            {short_description && (
              <p className="text-[11px] text-gray-500 italic line-clamp-2">
                {short_description}
              </p>
            )}
          </div>
        </div>

        {/* Selector de Talla (product_variants) */}
        {hasVariants && (
          <div className="mb-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-honey-dark mb-3">
              Seleccionar Talla
            </p>
            <div className="flex flex-wrap gap-2">
              {product_variants.map((v) => (
                <Button
                  key={v.id}
                  variant="ghost"
                  type="button"
                  onClick={() => setSelectedSize(v.value)}
                  className={cn(
                    "min-w-14 h-11 rounded-md cursor-pointer uppercase transition-all duration-200 border",
                    selectedSize === v.value
                      ? "bg-ink text-paper border-ink shadow-md"
                      : "bg-transparent text-ink border-honey-light/50 hover:border-ink",
                  )}
                >
                  {v.value}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAddToCart}
            className="w-full h-13 bg-ink text-paper hover:bg-ink/90 font-bold uppercase text-[11px] tracking-[0.2em] shadow-lg"
          >
            <ShoppingBag size={16} className="mr-2" />
            Añadir al Carrito
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full h-10 text-honey-dark hover:text-ink font-bold uppercase text-[9px] tracking-[0.2em]"
          >
            <Link
              href={`${baseUrl}/products/${slug}`}
              onClick={onClose}
              className="flex items-center gap-2"
            >
              Ver detalle completo
              <ArrowRight size={12} />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
