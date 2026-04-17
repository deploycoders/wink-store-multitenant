import React from "react";
import {
  DEFAULT_COMMERCE_SETTINGS,
  normalizeCommerceSettings,
} from "@/lib/siteConfig";

export const HeaderTitle = ({ className }) => (
  <div className={`space-y-1 ${className}`}>
    <h1 className="text-3xl font-black text-ink uppercase tracking-tight">
      Finalizar Compra
    </h1>
    <div className="h-1 w-12 bg-ink rounded-full" />
  </div>
);

export const BankDetailsCard = ({ commerceSettings, selectedMethod }) => {
  const commerce = normalizeCommerceSettings(
    commerceSettings || DEFAULT_COMMERCE_SETTINGS,
  );
  const activeMethods = (commerce.payment_methods || []).filter(Boolean);
  const methodConfigs = commerce.payment_method_configs || {};
  const methodsToRender = selectedMethod
    ? [
        selectedMethod,
        ...activeMethods.filter((method) => method !== selectedMethod),
      ]
    : activeMethods;
  const methodConfigCards = methodsToRender
    .map((method) => {
      const config = methodConfigs[method] || {};
      const hasData =
        config.owner ||
        config.identifier ||
        config.contact ||
        config.extra ||
        config.instructions;
      if (!hasData) return null;

      return (
        <div
          key={method}
          className="rounded-xl border border-honey-light bg-white px-3 py-2 space-y-1"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-ink">
            {method}
          </p>
          {config.owner ? (
            <p className="text-[11px] text-honey-dark">
              <span className="font-bold">Titular:</span> {config.owner}
            </p>
          ) : null}
          {config.identifier ? (
            <p className="text-[11px] text-honey-dark">
              <span className="font-bold">Identificador:</span>{" "}
              {config.identifier}
            </p>
          ) : null}
          {config.contact ? (
            <p className="text-[11px] text-honey-dark">
              <span className="font-bold">Contacto:</span> {config.contact}
            </p>
          ) : null}
          {config.extra ? (
            <p className="text-[11px] text-honey-dark">
              <span className="font-bold">Extra:</span> {config.extra}
            </p>
          ) : null}
          {config.instructions ? (
            <p className="text-[11px] text-honey-dark whitespace-pre-line leading-relaxed">
              {config.instructions}
            </p>
          ) : null}
        </div>
      );
    })
    .filter(Boolean);

  return (
    <div className="bg-honey-light/20 border border-honey-light/50 p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-honey-dark">
          Formas de Pago
        </h3>
        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded-full border border-green-100 uppercase">
          Activo
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {methodsToRender.map((method) => (
          <span
            key={method}
            className="px-2 py-1 bg-white text-ink border border-honey-light rounded-full text-[9px] font-bold uppercase tracking-widest"
          >
            {method}
          </span>
        ))}
      </div>

      {methodConfigCards.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-honey-dark/60">
            Instrucciones por método
          </p>
          <div className="space-y-2">{methodConfigCards}</div>
        </div>
      ) : (
        <div className="rounded-xl border border-honey-light bg-white px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-ink">
            Sin datos de métodos configurados
          </p>
          <p className="text-[11px] text-honey-dark">
            Configura tus métodos en el panel administrativo para mostrarlos
            aquí.
          </p>
        </div>
      )}
    </div>
  );
};
