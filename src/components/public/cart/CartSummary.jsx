"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CartSummary({ totalItems, subtotal, discount = 0 }) {
  const total = subtotal;

  return (
    <div className="border border-honey-light/50 rounded-4xl p-6 md:p-8 shadow-2xl shadow-ink/5 sticky top-24">
      <h2 className="text-xl font-serif font-bold text-ink mb-6 uppercase tracking-tighter">
        Resumen del pedido
      </h2>

      {/* DESGLOSE */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-honey-dark uppercase tracking-widest font-bold">
            Subtotal
          </span>
          <span className="font-bold text-ink">${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-honey-dark uppercase tracking-widest font-bold">
              Discount (-20%)
            </span>
            <span className="font-bold text-red-500">
              -${discount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-honey-dark uppercase tracking-widest font-bold">
            Envio
          </span>
          <span
            className={cn(
              "font-bold uppercase tracking-tighter",
              subtotal >= 50 ? "text-green-600" : "text-amber-600",
            )}
          >
            {subtotal >= 50 ? "Gratuito" : "Cobro en destino"}
          </span>
        </div>

        <div className="pt-4 border-t border-honey-light/50 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-serif font-bold text-ink uppercase tracking-tight">
              Total
            </span>
            <span className="text-3xl font-serif font-bold text-ink">
              ${total.toFixed(2)}
            </span>
          </div>
          <p className="text-[9px] text-honey-dark italic font-medium text-center mt-2">
            * Envío gratuito VIP en compras mayores a $50
          </p>
        </div>
      </div>

      {/* BOTÓN CHECKOUT */}
      <Button
        asChild
        className="w-full h-14 bg-ink text-paper hover:bg-ink/90 shadow-xl shadow-ink/10 font-bold uppercase text-[11px] tracking-[0.2em] group"
      >
        <Link
          href="/checkout"
          className="flex items-center justify-center gap-2"
        >
          Pagar ahora{" "}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </Button>
    </div>
  );
}
