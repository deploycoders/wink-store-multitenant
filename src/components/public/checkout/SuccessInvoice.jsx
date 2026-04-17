"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Download, Eye } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME } from "@/lib/siteConfig";

export function SuccessInvoice({
  formData,
  finalTotal,
  purchasedItems,
  orderId,
  orderNumber,
}) {
  const { site_name, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;

  const orderCode = useMemo(() => {
    if (orderNumber) return String(orderNumber).padStart(5, "0");
    if (orderId) return String(orderId).padStart(5, "0");
    return "00000";
  }, [orderId, orderNumber]);

  const issueDate = useMemo(
    () =>
      new Date().toLocaleDateString("es-VE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const buildInvoiceBlob = async () => {
    // Importamos librerías pesadas solo al momento de generar PDF
    const [{ pdf }, { InvoicePDF }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/InvoicePDF"),
    ]);

    const doc = (
      <InvoicePDF
        formData={formData}
        finalTotal={finalTotal}
        purchasedItems={purchasedItems}
        orderCode={orderCode}
        brand={brand}
        issueDate={issueDate}
      />
    );

    return pdf(doc).toBlob();
  };

  const handleViewPDF = async () => {
    const asBlob = await buildInvoiceBlob();
    const objectUrl = URL.createObjectURL(asBlob);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  };

  const handleDownloadPDF = async () => {
    const asBlob = await buildInvoiceBlob();
    const objectUrl = URL.createObjectURL(asBlob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `factura-${brand}-${orderCode}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icono de Éxito Animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      {/* Mensaje Principal */}
      <div className="mb-10 space-y-2">
        <h2 className="text-3xl font-serif font-black text-ink uppercase tracking-tight">
          ¡Pago Procesado!
        </h2>
        <p className="text-honey-dark max-w-md mx-auto">
          Gracias por tu compra. Tu orden{" "}
          <span className="font-mono font-bold">#{orderCode}</span> ya fue
          procesada
        </p>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          {/* BOTÓN VER (Pestaña nueva) */}
          <button
            onClick={handleViewPDF}
            className="flex items-center cursor-pointer justify-center gap-2 bg-white border-2 border-ink text-ink h-14 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-ink hover:text-white"
          >
            <Eye size={18} />
            Ver Factura
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center cursor-pointer justify-center gap-2 bg-emerald-600 text-white h-14 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-emerald-700"
          >
            <Download size={18} />
            Descargar
          </button>
        </div>

        {/* BOTÓN VOLVER (Separado abajo) */}
        <Link
          href={`${baseUrl}/products`}
          className="flex items-center justify-center gap-2 bg-ink text-paper h-16 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all hover:scale-[1.02] mt-2 shadow-lg"
        >
          <ShoppingBag size={20} />
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
