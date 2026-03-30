"use client";

import { Building2, Shield, Smartphone, Wallet } from "lucide-react";
import SettingsSectionHeader from "./SettingsSectionHeader";
import {
  inputClassName,
  labelClassName,
  sectionClassName,
} from "./siteSettingsStyles";

const PAYMENT_OPTIONS = [
  "Pago Movil",
  // "PayPal",
  // "Zelle",
  // "Binance",
  // "Transferencia",
];

export default function CommerceSettings({ value, onChange }) {
  const handleFieldChange = (field, nextValue) => {
    onChange({ ...value, [field]: nextValue });
  };

  const updateProductNotice = (index, nextValue) => {
    const currentNotices = Array.isArray(value.product_notices)
      ? [...value.product_notices]
      : [];
    currentNotices[index] = nextValue;
    handleFieldChange("product_notices", currentNotices);
  };

  return (
    <section className={sectionClassName}>
      <SettingsSectionHeader
        icon={<Wallet size={22} />}
        title="Comercio y Legal"
        description="Configura metodos de pago, datos de cobro y textos legales"
      />

      <div className="space-y-8">
        <div className="max-w-sm">
          <div>
            <label className={labelClassName}>
              <Smartphone size={10} /> WhatsApp ventas
            </label>
            <input
              type="text"
              value={value.whatsapp_number}
              onChange={(e) =>
                handleFieldChange("whatsapp_number", e.target.value)
              }
              className={inputClassName}
              placeholder="584245555555"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className={labelClassName}>Metodos de pago activos</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((method) => (
              <button
                key={method}
                type="button"
                className="px-4 h-10 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white border-slate-900"
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className={labelClassName}>Formulario Pago Movil</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClassName}>
                <Building2 size={10} /> Banco
              </label>
              <input
                type="text"
                value={value.bank_name}
                onChange={(e) => handleFieldChange("bank_name", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>
                <Smartphone size={10} /> Telefono banco
              </label>
              <input
                type="text"
                value={value.bank_phone}
                onChange={(e) => handleFieldChange("bank_phone", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>
                <Building2 size={10} /> Documento bancario (CI/RIF)
              </label>
              <input
                type="text"
                value={value.bank_document}
                onChange={(e) =>
                  handleFieldChange("bank_document", e.target.value)
                }
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        {/* Formularios avanzados por método (PayPal/Zelle/Binance/etc.) */}
        {/* Se dejan comentados para activarlos en una actualización futura. */}
        {/*
        <div className="space-y-3">
          <label className={labelClassName}>Formularios por metodo</label>
          ...inputs avanzados por metodo...
        </div>
        */}

        <div className="space-y-3">
          <label className={labelClassName}>
            Avisos en detalle de producto (max. 3)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[0, 1, 2].map((idx) => (
              <textarea
                key={idx}
                value={(value.product_notices || [])[idx] || ""}
                onChange={(e) => updateProductNotice(idx, e.target.value)}
                className={`${inputClassName} h-20 py-3 resize-none`}
                placeholder={`Aviso ${idx + 1} (envios, delivery, cambios, etc.)`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>
              <Shield size={10} /> Titulo Privacidad
            </label>
            <input
              type="text"
              value={value.privacy_title}
              onChange={(e) =>
                handleFieldChange("privacy_title", e.target.value)
              }
              className={inputClassName}
            />
            <textarea
              value={value.privacy_content}
              onChange={(e) =>
                handleFieldChange("privacy_content", e.target.value)
              }
              className={`${inputClassName} h-32 py-4 resize-none mt-3`}
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Shield size={10} /> Titulo Terminos
            </label>
            <input
              type="text"
              value={value.terms_title}
              onChange={(e) => handleFieldChange("terms_title", e.target.value)}
              className={inputClassName}
            />
            <textarea
              value={value.terms_content}
              onChange={(e) =>
                handleFieldChange("terms_content", e.target.value)
              }
              className={`${inputClassName} h-32 py-4 resize-none mt-3`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
