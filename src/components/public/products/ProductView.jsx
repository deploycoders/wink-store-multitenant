"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/useCartStore";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import { useSiteConfig } from "@/context/SiteConfigContext";
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_SITE_NAME,
  normalizeCommerceSettings,
} from "@/lib/siteConfig";
import AdaptiveImage from "@/components/ui/AdaptiveImage";

export default function ProductView({ product }) {
  const { site_name, commerce_settings, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;
  const commerce = normalizeCommerceSettings(
    commerce_settings || DEFAULT_COMMERCE_SETTINGS,
  );
  const productNotices = (commerce.product_notices || [])
    .filter(Boolean)
    .slice(0, 3);
  // Desestructuramos product_variants que es como viene de tu consulta en Supabase
  const {
    name,
    description,
    short_description,
    price,
    discount_price,
    images,
    product_variants,
  } = product;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
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

  const productImages = Array.isArray(images) ? images : ["/placeholder.jpg"];

  const handleAddToCart = () => {
    // CORRECCIÓN: Usar 'product_variants' en lugar de 'variants'
    if (product_variants && product_variants.length > 0 && !selectedSize) {
      Swal.fire({
        title: "¡Atención!",
        text: "Selecciona una talla para poder continuar.",
        icon: "warning",
        confirmButtonColor: "#1A1A1A",
        background: "#FBF9F6",
        color: "#1A1A1A",
        borderRadius: "2rem",
      });
      return false;
    }

    addItem(product, 1, selectedSize, selectedVariant);
    return true;
  };

  useEffect(() => {
    console.log("Estado de talla actualizado:", selectedSize);
  }, [selectedSize]);

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (added) {
      router.push(`${baseUrl}/checkout`);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* --- GALERÍA --- */}
        <div className="md:col-span-7 flex flex-col lg:flex-row gap-4 w-full">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:w-20 order-1 lg:order-0">
            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative shrink-0 w-16 h-20 md:w-20 md:h-24 lg:w-full cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300",
                  selectedImage === index
                    ? "border-black"
                    : "border-transparent",
                )}
              >
                <AdaptiveImage
                  src={img}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          <div className="relative flex-1 aspect-3/4 bg-secondary rounded-2xl overflow-hidden shadow-md order-2 lg:order-0">
            <AdaptiveImage
              src={productImages[selectedImage]}
              alt={name || `Producto de ${brand}`}
              fill
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>
        </div>

        {/* --- INFORMACIÓN --- */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <section>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
              {name}
            </h1>
            <div className="mt-2 flex items-end gap-3">
              {hasActiveOffer && (
                <p className="text-sm font-semibold text-red-500 line-through">
                  ${finalRegularPrice.toFixed(2)}
                </p>
              )}
              <p className="text-3xl font-bold text-black">
                ${finalPrice.toFixed(2)}
              </p>
            </div>
            {priceAdjustment > 0 && (
              <p className="mt-1 text-xs font-medium text-amber-700">
                Esta variante tiene un recargo de +${priceAdjustment.toFixed(2)}{" "}
                por {selectedVariant?.name?.toLowerCase() || "atributo"}.
              </p>
            )}
            {hasActiveOffer && (
              <p className="mt-1 text-xs font-semibold text-red-500 uppercase tracking-wide">
                Oferta activa
              </p>
            )}
          </section>

          {short_description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {short_description}
            </p>
          )}

          {/* VARIANTES DE TALLA */}
          {/* VARIANTES DE TALLA */}
          {product_variants && product_variants.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-wider text-ink">
                  Seleccionar Talla
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product_variants.map((v) => {
                  const isSelected = selectedSize === v.value;
                  // Verifica en tu base de datos si stock_adjustment tiene valor
                  const isOutOfStock =
                    v.stock_adjustment !== null && v.stock_adjustment <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button" // Importante para evitar submits accidentales
                      disabled={isOutOfStock}
                      onClick={() => {
                        console.log("Seleccionando talla:", v.value); // Debug para consola
                        setSelectedSize(v.value);
                      }}
                      className={cn(
                        "min-w-15 h-12 rounded-md uppercase transition-all duration-200 border text-xs font-bold",
                        "cursor-pointer disabled:cursor-not-allowed select-none", // Asegura el cursor
                        isSelected
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-transparent text-black border-gray-200 hover:border-black",
                        isOutOfStock && "opacity-20 italic",
                      )}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-honey-dark italic">
              Talla única disponible
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full h-14 font-bold cursor-pointer tracking-widest transition-all border-slate active:scale-95 hover:bg-black hover:text-white duration-300"
            >
              Agregar al carrito
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBuyNow}
              className="w-full h-14 font-bold cursor-pointer tracking-widest border border-black transition-all active:scale-95 hover:bg-black hover:text-white duration-300"
            >
              Comprar ahora
            </Button>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="w-full"
          >
            <AccordionItem value="item-1" className="border-b-gray-300">
              <AccordionTrigger className="uppercase text-sm font-semibold tracking-wider hover:no-underline">
                Descripción
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 prose prose-sm max-w-none">
                {description ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  "No hay descripción disponible."
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {productNotices.map((notice, index) => (
            <p
              key={`${index}-${notice}`}
              className="text-xs text-muted-foreground italic"
            >
              {notice}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
