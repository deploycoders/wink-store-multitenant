import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Download } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_NAME, formatSiteHandle } from "@/lib/siteConfig";

export function SuccessInvoice({ formData, finalTotal, purchasedItems, orderId }) {
    const { site_name } = useSiteConfig();
    const brand = site_name || DEFAULT_SITE_NAME;
    const brandHandle = formatSiteHandle(brand);
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full">
            {/* VISTA NORMAL (SE OCULTA AL IMPRIMIR) */}
            <div className="flex flex-col items-center justify-center py-10 text-center print:hidden">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8"
                >
                    <CheckCircle2 size={48} />
                </motion.div>

                <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-serif font-black text-ink uppercase tracking-tight">¡Pago Aprobado!</h2>
                    <p className="text-honey-dark max-w-sm mx-auto">
                        Gracias por tu compra, <span className="text-ink font-bold">{formData.name}</span>. 
                        Tu pedido ha sido validado exitosamente.
                    </p>
                </div>

                <div className="w-full max-w-md bg-white border border-honey-light/50 rounded-[2.5rem] p-8 shadow-sm space-y-6 mb-8 mx-auto">
                    <div className="flex justify-between items-center border-b border-honey-light/20 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-honey-dark">Total Pagado</span>
                        <span className="text-lg font-serif font-bold text-ink">${finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-honey-dark font-bold space-y-2 text-left">
                        <p>Status: <span className="text-emerald-500">Aprobado y Procesando</span></p>
                        <p>Orden: #{orderId?.slice(-6).toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105"
                    >
                        <Download size={18} />
                        Descargar Factura PDF
                    </button>
                    <Link
                        href="/products"
                        className="flex items-center justify-center gap-2 bg-ink text-paper px-8 h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105"
                    >
                        <ShoppingBag size={18} />
                        Ir a la Tienda
                    </Link>
                </div>
            </div>

            {/* VISTA DE IMPRESIÓN (OCULTA EN PANTALLA) */}
            <div
                className="hidden print:block bg-white text-black w-full max-w-[440px] mx-auto p-4 text-[11px] leading-tight"
                style={{ fontFamily: "sans-serif" }}
            >
                <div className="border border-black p-3 space-y-3">
                    <div className="text-center border-b border-black pb-2">
                        <p className="text-sm font-black uppercase tracking-wide">{brand}</p>
                        <p className="text-[10px] uppercase">Nota de Entrega</p>
                        <p className="text-[10px]">Pedido #{orderId?.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-700">@{brandHandle}</p>
                    </div>

                    <div className="space-y-1 text-[10px]">
                        <p><span className="font-bold">Fecha:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-bold">Cliente:</span> {formData.name}</p>
                        <p><span className="font-bold">Teléfono:</span> {formData.phone}</p>
                        <p><span className="font-bold">CI/RIF:</span> {formData.idNumber}</p>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="border-y border-black">
                                <th className="text-left py-1">Cant</th>
                                <th className="text-left py-1">Detalle</th>
                                <th className="text-right py-1">Unit</th>
                                <th className="text-right py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchasedItems?.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="py-1">{item.quantity}</td>
                                    <td className="py-1 pr-2">
                                        {item.name || item.title}
                                        {item.variant ? (
                                            <span className="block text-[9px] text-gray-600 uppercase">
                                                {item.variant}
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="py-1 text-right">${Number(item.price).toFixed(2)}</td>
                                    <td className="py-1 text-right font-bold">
                                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t border-black pt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between">
                            <span className="font-bold uppercase">Pago</span>
                            <span>{(formData.paymentMethod || "Pago Movil").toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black">
                            <span className="uppercase">Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="uppercase">Pendiente</span>
                            <span>$0.00</span>
                        </div>
                    </div>

                    {formData.notes ? (
                        <div className="border-t border-dashed border-gray-500 pt-2 text-[10px]">
                            <p className="font-bold uppercase mb-1">Notas</p>
                            <p className="text-gray-700">{formData.notes}</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
