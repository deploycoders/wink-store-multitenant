"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

// Store e iconos
import { useCartStore } from "@/lib/useCartStore";
import { Button } from "@/components/ui/button";

// Componentes Modulares
import { CustomerForm } from "@/components/public/checkout/CustomerForm";
import { PaymentFields } from "@/components/public/checkout/PaymentFields";
import { OrderSummary } from "@/components/public/checkout/OrderSummary";
import { SuccessInvoice } from "@/components/public/checkout/SuccessInvoice";
import { ValidationWaitScreen } from "@/components/public/checkout/ValidationWaitScreen";
import { HeaderTitle } from "@/components/public/checkout/UIElements";
import { processCheckoutOrder } from "@/app/actions/public/checkoutActions";
import { useSiteConfig } from "@/context/SiteConfigContext";
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_SITE_NAME,
  normalizeCommerceSettings,
  normalizeWhatsappNumber,
} from "@/lib/siteConfig";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(
    () => useCartStore.persist?.hasHydrated?.() ?? true,
  );
  const router = useRouter();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    phone: "",
    email: "",
    paymentMethod: "",
    reference: "",
    notes: "",
  });
  const { site_name, commerce_settings, tenant_slug, tenant_id } =
    useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;
  const commerce = normalizeCommerceSettings(
    commerce_settings || DEFAULT_COMMERCE_SETTINGS,
  );
  const activePaymentMethods = (commerce.payment_methods || []).filter(Boolean);
  const whatsappNumber = normalizeWhatsappNumber(commerce.whatsapp_number);
  const brandImageLabel = brand.replace(/\s+/g, "+");
  const selectedPaymentMethod =
    formData.paymentMethod || activePaymentMethods[0] || "";

  useEffect(() => {
    const unsubscribe = useCartStore.persist?.onFinishHydration?.(() =>
      setMounted(true),
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (items.length === 0 && !isSuccess && !isWaiting) {
      router.push(`${baseUrl}/products`);
    }
  }, [items, isSuccess, isWaiting, router]);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  const total = subtotal;

  const handleCustomerFound = (customer) => {
    setFormData((prev) => ({
      ...prev,
      name: customer.full_name || customer.nombre_completo || "",
      phone: customer.phone || customer.telefono || "",
      email: customer.email || "",
    }));

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `¡Bienvenido de nuevo, ${customer.nombre_completo.split(" ")[0]}!`,
      showConfirmButton: false,
      timer: 3000,
      background: "#FBF9F6",
      color: "#1A1A1A",
    });
  };

  const handleVerifyPayment = () => {
    if (
      !formData.name ||
      !formData.idNumber ||
      !formData.reference ||
      !formData.phone ||
      !selectedPaymentMethod
    ) {
      Swal.fire({
        title: "¡Atención!",
        text: "Completa cliente, metodo de pago y referencia para verificar tu pago.",
        icon: "warning",
        confirmButtonColor: "#1A1A1A",
        background: "#FBF9F6",
        color: "#1A1A1A",
      });
      return;
    }

    Swal.fire({
      title: "¿Confirmar Envío?",
      text: "Se guardará tu pedido y se abrirá WhatsApp para enviar tu comprobante de pago.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, procesar pedido",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1A1A1A",
      cancelButtonColor: "#A68D6B",
      background: "#FBF9F6",
      color: "#1A1A1A",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Procesando pedido...",
          text: "Estamos guardando tu información y reservando tu inventario.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: "#FBF9F6",
          color: "#1A1A1A",
        });

        const payload = {
          ...formData,
          paymentMethod: selectedPaymentMethod,
          tenantId: tenant_id || null,
          tenantSlug: tenant_slug || null,
        };
        const response = await processCheckoutOrder(payload, items, total);

        if (!response.success) {
          Swal.fire({
            title: "Error al procesar",
            text:
              response.error ||
              "Ocurrió un problema guardando tu pedido. Por favor intenta de nuevo.",
            icon: "error",
            confirmButtonColor: "#1A1A1A",
            background: "#FBF9F6",
            color: "#1A1A1A",
          });
          return;
        }

        const isFreeShipping = total >= 50;
        const shippingMethod = isFreeShipping
          ? "GRATIS ✨"
          : "COBRO EN DESTINO 🚚";

        // CORRECCIÓN: Cambiamos item.title por item.name
        const orderDetails = items
          .map(
            (item) =>
              `- ${item.name} (Talla: ${item.variant}) x${item.quantity}`,
          )
          .join("\n");

        // Añadimos el ID de orden (si ya lo tienes de la respuesta de Supabase)
        // y el mensaje final para la foto
        const safeOrderId =
          response?.orderId !== undefined && response?.orderId !== null
            ? String(response.orderId)
            : "";
        const orderIdShort = safeOrderId
          ? `(#${safeOrderId.slice(-6).toUpperCase()})`
          : "";

        const message = `Hola ${brand}! 👋

He realizado un pago por ${selectedPaymentMethod}.

📌 *DATOS DEL PAGO*
- Titular: ${formData.name}
- CI/RIF: ${formData.idNumber}
- Ref: ${formData.reference}
- Telf: ${formData.phone}

🛒 *PEDIDO ${orderIdShort}*
${orderDetails}

💰 *TOTAL*: $${total.toFixed(2)}
🚚 *ENVÍO*: ${shippingMethod}

📝 *NOTAS*: ${formData.notes || "Ninguna"}

📸 *Adjunto el comprobante de pago aquí abajo:*`;

        Swal.close();

        const whatsappHref = whatsappNumber
          ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
          : "";

        if (whatsappHref) window.open(whatsappHref, "_blank");

        setFinalTotal(total);
        setOrderId(safeOrderId || null);
        setPurchasedItems([...items]);
        clearCart();
        setIsWaiting(true);
      }
    });
  };

  return (
    <main className="min-h-screen p-6 md:p-10 bg-paper print:bg-white print:p-0 print:min-h-0">
      <div className="max-w-4xl mx-auto print:max-w-none print:m-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isWaiting && !isSuccess ? (
            <ValidationWaitScreen
              orderId={orderId}
              whatsappNumber={whatsappNumber}
              onSuccess={() => {
                setIsWaiting(false);
                setIsSuccess(true);
              }}
            />
          ) : !isSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <HeaderTitle className="block lg:hidden" />
              <div className="space-y-8 order-2 lg:order-1">
                <HeaderTitle className="hidden lg:block" />

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-ink/40 border-b border-zinc-100 pb-2">
                      01. Información del Cliente
                    </h2>
                    <CustomerForm
                      formData={formData}
                      setFormData={setFormData}
                      onCustomerFound={handleCustomerFound}
                    />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-ink/40 border-b border-zinc-100 pb-2">
                      02. Detalles del Pago
                    </h2>
                    <PaymentFields
                      formData={formData}
                      setFormData={setFormData}
                      paymentMethods={activePaymentMethods}
                      selectedPaymentMethod={selectedPaymentMethod}
                      commerceSettings={commerce}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVerifyPayment}
                  className="w-full h-16 bg-ink cursor-pointer text-paper hover:bg-ink/90 shadow-2xl shadow-ink/20 font-bold uppercase text-[11px] tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  Verificar Pago & Pedir por WhatsApp
                </Button>
              </div>
              <div className="order-1 lg:order-2">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  total={total}
                  brandImageLabel={brandImageLabel}
                />
              </div>
            </div>
          ) : (
            <SuccessInvoice
              formData={formData}
              finalTotal={finalTotal}
              purchasedItems={purchasedItems}
              orderId={orderId}
            />
          )}
        </motion.div>
      </div>
    </main>
  );
}
