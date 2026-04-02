import { supabase } from "./supabase";

export const createOrder = async (formData, items, total) => {
  const tenantId = formData.tenantId || null;

  // 1. Primero manejamos al cliente (Upsert: inserta o actualiza por cédula)
  const { data: customer, error: custError } = await supabase
    .from("clientes")
    .upsert(
      {
        tenant_id: tenantId,
        cedula: formData.idNumber,
        nombre_completo: formData.name,
        telefono: formData.phone,
        email: formData.email,
      },
      { onConflict: "tenant_id,cedula" },
    )
    .select()
    .single();

  if (custError) throw custError;

  // 2. Creamos la orden vinculada al cliente
  const { error: orderError } = await supabase.from("orders").insert([
    {
      tenant_id: tenantId,
      cliente_id: customer.id,
      cliente_nombre: formData.name,
      cedula: formData.idNumber,
      telefono: formData.phone,
      email: formData.email || null,
      referencia_pago: formData.reference,
      items: items,
      total: total,
      notas: formData.notes,
      estado: "Pendiente",
    },
  ]);

  if (orderError) throw orderError;
};
