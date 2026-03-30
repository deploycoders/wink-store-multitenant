import { supabase } from "./supabase";

export const createOrder = async (formData, items, total) => {
  // 1. Primero manejamos al cliente (Upsert: inserta o actualiza por cédula)
  const { data: customer, error: custError } = await supabase
    .from("clientes")
    .upsert(
      {
        cedula: formData.idNumber,
        nombre_completo: formData.name,
        telefono: formData.phone,
        email: formData.email,
      },
      { onConflict: "cedula" },
    )
    .select()
    .single();

  if (custError) throw custError;

  // 2. Creamos la orden vinculada al cliente
  const { error: orderError } = await supabase.from("orders").insert([
    {
      cliente_id: customer.id,
      referencia_pago: formData.reference,
      items: items,
      total: total,
      notas: formData.notes,
    },
  ]);

  if (orderError) throw orderError;
};
