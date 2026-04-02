"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShoppingBag,
  Download,
  Printer,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME, formatSiteHandle } from "@/lib/siteConfig";
import { PDFDownloadLink } from "@react-pdf/renderer";

export function SuccessInvoice({
  formData,
  finalTotal,
  purchasedItems,
  orderId,
}) {
  const { site_name, tenant_slug } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const brand = site_name || DEFAULT_SITE_NAME;

  const orderCode = useMemo(
    () => (orderId ? String(orderId).padStart(5, "0") : "00000"),
    [orderId],
  );

  const issueDate = useMemo(
    () =>
      new Date().toLocaleDateString("es-VE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  // Función para abrir el PDF en una pestaña nueva
  const handleViewPDF = async () => {
    const doc = (
      <InvoiceDocument
        formData={formData}
        finalTotal={finalTotal}
        purchasedItems={purchasedItems}
        orderCode={orderCode}
        brand={brand}
        issueDate={issueDate}
      />
    );
    const asBlob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(asBlob);
    window.open(url, "_blank");
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
          Gracias por tu compra,{" "}
          <span className="font-bold text-ink">{formData.name}</span>. Tu orden{" "}
          <span className="font-mono font-bold">#{orderCode}</span> ya está en
          camino.
        </p>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          {/* BOTÓN VER (Pestaña nueva) */}
          <button
            onClick={handleViewPDF}
            className="flex items-center justify-center gap-2 bg-white border-2 border-ink text-ink h-14 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-ink hover:text-white"
          >
            <Eye size={18} />
            Ver Factura
          </button>

          {/* BOTÓN DESCARGAR (Link directo) */}
          <PDFDownloadLink
            document={
              <InvoiceDocument
                formData={formData}
                finalTotal={finalTotal}
                purchasedItems={purchasedItems}
                orderCode={orderCode}
                brand={brand}
                issueDate={issueDate}
              />
            }
            fileName={`factura-${brand}-${orderCode}.pdf`}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white h-14 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all hover:bg-emerald-700"
          >
            {({ loading }) => (
              <>
                <Download size={18} />
                {loading ? "..." : "Descargar"}
              </>
            )}
          </PDFDownloadLink>
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
