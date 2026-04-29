import { cn } from "@/lib/utils";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";
import AdaptiveImage from "@/components/ui/AdaptiveImage";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

export function OrderSummary({
  items,
  subtotal,
  total,
  onVerify,
  deliveryFee = 0,
  threshold = 50,
  brandImageLabel = DEFAULT_SITE_NAME,
}) {
  const isFree = subtotal >= threshold && threshold > 0;

  return (
    <div className="bg-white border border-zinc-100 rounded-md p-8 shadow-xl shadow-zinc-200/50 h-fit">
      <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em] mb-8">
        Tu Pedido
      </h3>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.variant}`}
            className="flex gap-4 items-center"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F3F4F6]">
              <AdaptiveImage
                src={
                  item.images?.[0] ||
                  item.image_url ||
                  `https://placehold.co/400x600/png?text=${encodeURIComponent(
                    brandImageLabel,
                  )}`
                }
                alt={item.name || "Producto"}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-black text-ink uppercase tracking-tight leading-tight mb-0.5 truncate">
                {item.name}
              </h4>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                {item.variant && (
                  <>
                    <span className="text-ink/60">{item.variant}</span>
                    <span className="opacity-30">|</span>
                  </>
                )}
                <span>Cant: {item.quantity}</span>
              </p>
              <p className="text-[12px] font-bold text-ink mt-1">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-zinc-100 space-y-4">
        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">
          <span>Subtotal</span>
          <span className="text-ink">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">
          <span>Envío</span>
          <span className={cn(isFree ? "text-emerald-500" : "text-amber-500")}>
            {isFree
              ? "Gratis"
              : deliveryFee > 0
                ? `$${deliveryFee.toFixed(2)}`
                : "Cobro en destino"}
          </span>
        </div>

        <div className="pt-4 flex justify-between items-center text-ink">
          <span className="text-sm font-black uppercase tracking-[0.2em]">
            Total
          </span>
          <span className="text-2xl font-black">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          onClick={onVerify}
          className="w-full h-16 bg-ink text-paper hover:bg-ink/90 shadow-2xl shadow-ink/20 font-black uppercase text-[11px] tracking-[0.2em] rounded-md transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
        >
          Verificar Pago
          <ArrowRight
            size={16}
            className="ml-2 group-hover:translate-x-1 transition-transform"
          />
        </Button>

        <div className="flex items-center justify-center gap-2 text-zinc-400">
          <Lock size={12} className="opacity-50" />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
            Verifica bien tu pedido antes de confirmar el pago
          </span>
        </div>
      </div>
    </div>
  );
}
