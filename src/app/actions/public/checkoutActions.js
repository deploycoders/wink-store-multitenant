"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/auditLog";
import { formatWhatsappContactNumber } from "@/lib/siteConfig";

const normalizeVariantValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export async function processCheckoutOrder(formData, items, total) {
  try {
    const supabase = await createClient();
    const normalizedCustomerPhone = formatWhatsappContactNumber(
      formData.phone,
      "58",
    );

    // 1. Buscar o Crear Cliente
    let clienteId = null;
    let isNewClient = false;

    // Buscar cliente por cédula/RIF
    const { data: existingCustomer, error: searchError } = await supabase
      .from("clientes")
      .select("id")
      .eq("cedula", formData.idNumber)
      .single();

    if (existingCustomer) {
      clienteId = existingCustomer.id;
    } else if (searchError && searchError.code === "PGRST116") {
      // PGRST116 = No rows found → Crear nuevo cliente
      const { data: newCustomer, error: insertCustomerError } = await supabase
        .from("clientes")
        .insert([
          {
            cedula: formData.idNumber,
            nombre_completo: formData.name,
            telefono: normalizedCustomerPhone,
            email: formData.email,
          },
        ])
        .select("id")
        .single();

      if (insertCustomerError) {
        throw new Error(
          `Error al crear cliente: ${insertCustomerError.message}`
        );
      }
      clienteId = newCustomer.id;
      isNewClient = true;

      // Registrar nuevo cliente en bitácora
      await logAudit(supabase, {
        tipo: "cliente",
        accion: "crear",
        descripcion: `Nuevo cliente registrado: ${formData.name} (Cédula: ${formData.idNumber})`,
        usuario_nombre: "Sistema (Checkout)",
        meta: {
          cedula: formData.idNumber,
          nombre: formData.name,
          telefono: formData.phone,
          telefono_normalizado: normalizedCustomerPhone,
          email: formData.email,
        },
      });
    } else {
      throw new Error(`Error al buscar cliente: ${searchError.message}`);
    }

    // 2. Validar y Descontar Stock (variante y global)
    for (const item of items) {
      if (!item.id) continue;

      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) continue;

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("id", item.id)
        .single();

      if (productError || !productData) {
        throw new Error(
          `No se pudo validar stock para el producto ${item.name || item.title || item.id}.`,
        );
      }

      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, value, stock_adjustment")
        .eq("product_id", item.id);

      if (variantsError) {
        throw new Error(
          `Error al validar variantes de ${productData.name}: ${variantsError.message}`,
        );
      }

      const hasVariants = Array.isArray(variantsData) && variantsData.length > 0;
      const selectedVariantValue = normalizeVariantValue(item.variant);

      if (hasVariants) {
        if (!selectedVariantValue) {
          throw new Error(
            `El producto ${productData.name} requiere seleccionar una variante.`,
          );
        }

        const matchedVariant = variantsData.find(
          (variant) =>
            normalizeVariantValue(variant.value) === selectedVariantValue,
        );

        if (!matchedVariant) {
          throw new Error(
            `La variante "${item.variant}" ya no está disponible para ${productData.name}.`,
          );
        }

        const currentVariantStock = Number(matchedVariant.stock_adjustment) || 0;
        if (currentVariantStock < quantity) {
          throw new Error(
            `Stock insuficiente en ${productData.name} (${matchedVariant.value}). Disponible: ${currentVariantStock}.`,
          );
        }

        const nextVariantStock = currentVariantStock - quantity;
        const { error: updateVariantError } = await supabase
          .from("product_variants")
          .update({ stock_adjustment: nextVariantStock })
          .eq("id", matchedVariant.id);

        if (updateVariantError) {
          throw new Error(
            `Error actualizando stock de variante para ${productData.name}: ${updateVariantError.message}`,
          );
        }

        const recalculatedTotalStock = variantsData.reduce(
          (acc, variant) =>
            acc +
            (variant.id === matchedVariant.id
              ? nextVariantStock
              : Number(variant.stock_adjustment) || 0),
          0,
        );

        const { error: updateProductError } = await supabase
          .from("products")
          .update({ stock: Math.max(0, recalculatedTotalStock) })
          .eq("id", item.id);

        if (updateProductError) {
          throw new Error(
            `Error actualizando stock global de ${productData.name}: ${updateProductError.message}`,
          );
        }
      } else {
        const currentStock = Number(productData.stock) || 0;
        if (currentStock < quantity) {
          throw new Error(
            `Stock insuficiente para ${productData.name}. Disponible: ${currentStock}.`,
          );
        }

        const nextStock = currentStock - quantity;
        const { error: updateProductError } = await supabase
          .from("products")
          .update({ stock: Math.max(0, nextStock) })
          .eq("id", item.id);

        if (updateProductError) {
          throw new Error(
            `Error actualizando stock de ${productData.name}: ${updateProductError.message}`,
          );
        }
      }
    }

    // 3. Crear la Orden (Venta)
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          cliente_id: clienteId,
          total: total,
          referencia_pago: formData.reference,
          notas: `Metodo de pago: ${formData.paymentMethod || "No especificado"}${
            formData.notes ? ` | ${formData.notes}` : ""
          }`,
          items: items,
          estado: "Pendiente",
        },
      ])
      .select("id")
      .single();

    if (orderError) {
      throw new Error(`Error al crear orden: ${orderError.message}`);
    }

    // Registrar nueva venta en bitácora
    await logAudit(supabase, {
      tipo: "venta",
      accion: "crear",
      descripcion: `Nueva venta ${isNewClient ? "(cliente nuevo)" : "(cliente existente)"}: ${formData.name} — Total: $${Number(total).toFixed(2)}`,
      usuario_nombre: "Sistema (Checkout)",
      meta: {
        order_id: newOrder.id,
        cliente_id: clienteId,
        cliente_nuevo: isNewClient,
        total,
        payment_method: formData.paymentMethod,
        referencia: formData.reference,
        items: items.map((i) => ({ id: i.id, name: i.name || i.title, qty: i.quantity, price: i.price })),
      },
    });

    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error("Error en processCheckoutOrder:", error);
    return { success: false, error: error.message };
  }
}
