import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useSiteConfig } from "@/context/SiteConfigContext";

const CUSTOMER_TABLE = "customers";

export function CustomerForm({ formData, setFormData, onCustomerFound }) {
  const { tenant_id: tenantId } = useSiteConfig();
  const [isSearching, setIsSearching] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [customerLocked, setCustomerLocked] = useState(false);
  const lookupCacheRef = useRef(new Map());

  // Búsqueda manual para evitar consultas innecesarias por blur
  const handleCustomerLookup = async () => {
    if (formData.idNumber.length < 6) return; // Mínimo de caracteres para buscar
    if (!tenantId) return;

    try {
      setLookupMessage("");
      setIsSearching(true);
      const lookupKey = `${tenantId}:${String(formData.idNumber).trim()}`;
      const cachedCustomer = lookupCacheRef.current.get(lookupKey);

      if (cachedCustomer) {
        onCustomerFound(cachedCustomer);
        setCustomerLocked(true);
        setLookupMessage("Cliente encontrado (cache).");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from(CUSTOMER_TABLE)
        .select("*")
        .eq("id_number", formData.idNumber)
        .eq("tenant_id", tenantId)
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        lookupCacheRef.current.set(lookupKey, data);
        onCustomerFound(data);
        setCustomerLocked(true);
        setLookupMessage("Cliente encontrado y datos autocompletados.");
      } else {
        setCustomerLocked(false);
        setLookupMessage("Cliente nuevo. Completa los datos para continuar.");
      }
    } catch (error) {
      setCustomerLocked(false);
      setLookupMessage("No se pudo buscar el cliente en este momento.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnableManualEdit = () => {
    setCustomerLocked(false);
    setLookupMessage("Edición manual activada para este cliente.");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
            Cédula / RIF (ID Único)
          </label>
          <Input
            type="text"
            value={formData.idNumber}
            onChange={(e) =>
              setFormData({ ...formData, idNumber: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCustomerLookup();
              }
            }}
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="V-000000"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCustomerLookup}
              disabled={isSearching || !tenantId || formData.idNumber.length < 6}
              className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-ink text-paper disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSearching ? "Buscando..." : "Buscar Cliente"}
            </button>
            {customerLocked ? (
              <button
                type="button"
                onClick={handleEnableManualEdit}
                className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-ink/20 text-ink cursor-pointer"
              >
                Editar Datos
              </button>
            ) : null}
          </div>
          {lookupMessage ? (
            <p className="text-[9px] text-honey-dark/90 px-1">{lookupMessage}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
            Nombre Completo
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={customerLocked}
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="Titular del pago"
          />
        </div>
      </div>

      {/* Campos adicionales para el CMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
            Teléfono (WhatsApp)
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            disabled={customerLocked}
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="+58 424..."
          />
          <p className="text-[9px] text-honey-dark/80 px-1">
            Recomendado: formato internacional (ej. +58...)
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
            Correo (Opcional)
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={customerLocked}
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="tu@email.com"
          />
        </div>
      </div>
    </div>
  );
}
