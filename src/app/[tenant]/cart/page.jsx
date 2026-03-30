"use client";

import { useCartStore } from "@/lib/useCartStore";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Componentes modulares
import CartItemCard from "@/components/public/cart/CartItemCard";
import CartSummary from "@/components/public/cart/CartSummary";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { tenant_slug } = useSiteConfig();
  const [mounted, setMounted] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-honey-dark font-serif italic animate-pulse">
          Cargando selección...
        </p>
      </div>
    );

  if (items.length === 0) {
    return (
      <main className="h-auto">
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center text-honey-dark mb-8 mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold uppercase tracking-tighter text-ink mb-6">
              Tu carrito esta vacío
            </h1>
            <p className="text-honey-dark mb-10 max-w-sm mx-auto italic font-medium">
              Añade piezas a tu colección para continuar
            </p>
            <Button
              asChild
              className="px-10 h-14 bg-ink text-paper hover:bg-ink/90 shadow-2xl shadow-ink/10 uppercase text-[11px] font-bold tracking-widest"
            >
              <Link href={`${baseUrl}/products`}>Ver Productos</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-auto pb-24">
      <div className="text-center pt-12 md:pt-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold uppercase tracking-tighter text-ink mb-2">
          Your Shopping Cart
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* COLUMNA IZQUIERDA: PRODUCTOS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-serif font-bold text-ink uppercase tracking-tight">
              Your cart
            </h2>

            {/* TOOLBAR */}
            <div className="border border-honey-light/50 rounded-full px-6 py-4 flex items-center justify-between shadow-sm">
              <div
                className="flex items-center gap-3 cursor-pointer group select-none"
                onClick={() => setSelectAll(!selectAll)}
              >
                <div className="text-honey-dark group-hover:text-ink transition-colors">
                  {selectAll ? (
                    <CheckSquare size={18} className="text-ink" />
                  ) : (
                    <Square size={18} />
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 group">
                  Delete All
                </p>
              </div>
              <button
                onClick={clearCart}
                className="bg-ink text-paper px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-ink/10 hover:scale-105 transition-transform"
              >
                Delete
              </button>
            </div>

            {/* LISTADO */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemCard
                    key={`${item.id}-${item.variant}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN  */}
        <div className="lg:col-span-4">
          <CartSummary
            totalItems={getTotalItems()}
            subtotal={getTotalPrice()}
            deliveryFee={0}
          />
        </div>
      </div>

      <div className="mt-20 text-center">
        <Link
          href={`${baseUrl}/products`}
          className="inline-flex items-center gap-2 text-honey-dark hover:text-ink transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>
    </main>
  );
}
