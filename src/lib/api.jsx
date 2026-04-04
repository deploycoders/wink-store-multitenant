import { supabase } from "./supabase";

export const createOrder = async (formData, items, total) => {
  const tenantId = formData.tenantId || null;

  // 1. Primero manejamos al cliente (Upsert: inserta o actualiza por cédula)
  const { data: customer, error: custError } = await supabase
    .from("customers")
    .upsert(
      {
        tenant_id: tenantId,
        id_number: formData.idNumber,
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email,
      },
      { onConflict: "tenant_id,id_number" },
    )
    .select()
    .single();

  if (custError) throw custError;

  // 2. Creamos la orden vinculada al cliente
  const { error: orderError } = await supabase.from("orders").insert([
    {
      tenant_id: tenantId,
      customer_id: customer.id,
      customer_name: formData.name,
      customer_id_number: formData.idNumber,
      customer_phone: formData.phone,
      email: formData.email || null,
      referencia_pago: formData.reference,
      items: items,
      total: total,
      notas: formData.notes,
      estado: "pending",
    },
  ]);

  if (orderError) throw orderError;
};
