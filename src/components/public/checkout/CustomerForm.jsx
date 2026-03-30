import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function CustomerForm({ formData, setFormData, onCustomerFound }) {
  // Función para buscar cliente en Supabase
  const handleCedulaBlur = async () => {
    if (formData.idNumber.length < 6) return; // Mínimo de caracteres para buscar

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('cedula', formData.idNumber)
        .single();
        
      if (data && !error) {
        onCustomerFound(data);
      }
    } catch (error) {
      // Ignoramos silenciosamente si no lo encuentra (es un cliente nuevo)
    }
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
            onBlur={handleCedulaBlur} // <--- Gatillo de búsqueda
            onChange={(e) =>
              setFormData({ ...formData, idNumber: e.target.value })
            }
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="V-000000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-honey-dark px-1">
            Nombre Completo
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            className="rounded-2xl border-honey-light/50 focus-visible:ring-ink/10 h-12"
            placeholder="tu@email.com"
          />
        </div>
      </div>
    </div>
  );
}
