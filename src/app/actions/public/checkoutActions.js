"use server";

import { logAudit } from "@/lib/auditLog";
import { formatWhatsappContactNumber } from "@/lib/siteConfig";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const normalizeVariantValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const CUSTOMER_TABLE = "clientes";

const getErrorMessage = (error) =>
  error?.message || error?.details || "Error desconocido";

const isNoRowsError = (error) => error?.code === "PGRST116";

const isMissingTableError = (error) =>
  error?.code === "PGRST205" ||
  /Could not find the table/i.test(getErrorMessage(error));

const getMissingColumnName = (error) => {
  const message = getErrorMessage(error);
  if (!message) return null;

  const pgrstMatch = message.match(/Could not find the '([^']+)' column/i);
  if (pgrstMatch?.[1]) return pgrstMatch[1];

  const pgMatch = message.match(/column ["']?([^"'\s]+)["']? does not exist/i);
  if (pgMatch?.[1]) return pgMatch[1];

  return null;
};

const findExistingCustomer = async (supabase, idNumber, tenantId) =>
  supabase
    .from(CUSTOMER_TABLE)
    .select("id")
    .eq("cedula", idNumber)
    .eq("tenant_id", tenantId)
    .limit(1)
    .single();

const insertCustomer = async (supabase, payload) =>
  supabase
    .from(CUSTOMER_TABLE)
    .insert([payload])
    .select("id")
    .single();

const createOrderWithFallback = async (supabase, payload) => {
  const orderPayload = { ...payload };

  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .insert([orderPayload])
      .select("id")
      .single();

    if (!error) {
      return { data, error: null, usedPayload: orderPayload };
    }

    const missingColumn = getMissingColumnName(error);
    if (
      missingColumn &&
      Object.prototype.hasOwnProperty.call(orderPayload, missingColumn)
    ) {
      delete orderPayload[missingColumn];
      continue;
    }

    return { data: null, error, usedPayload: orderPayload };
  }
};

export async function processCheckoutOrder(formData, items, total) {
  try {
    const supabase = getAdminSupabaseClient();
    const normalizedCustomerPhone = formatWhatsappContactNumber(
      formData.phone,
      "58",
    );

    let tenantId = formData?.tenantId || null;
    const tenantSlug = formData?.tenantSlug || null;

    if (!tenantId && tenantSlug) {
      const { data: tenantRow, error: tenantLookupError } = await supabase
        .from("tenants")
        .select("tenant_id")
        .eq("slug", tenantSlug)
        .single();

      if (tenantLookupError) {
        throw new Error(
          `No se pudo resolver tenant por slug: ${getErrorMessage(tenantLookupError)}`,
        );
      }

      tenantId = tenantRow?.tenant_id || null;
    }

    if (!tenantId) {
      throw new Error("No se pudo resolver el tenant para registrar el pedido.");
    }

    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .select("tenant_id, status")
      .eq("tenant_id", tenantId)
      .single();

    if (tenantError || !tenantData) {
      throw new Error(
        `No se pudo validar el tenant del pedido: ${getErrorMessage(tenantError)}`,
      );
    }

    if (String(tenantData.status || "").toLowerCase() !== "active") {
      throw new Error("La tienda no está activa para procesar pedidos.");
    }

    // 1. Buscar o Crear Cliente
    let clienteId = null;
    let isNewClient = false;

    const { data: existingCustomer, error: searchError } =
      await findExistingCustomer(supabase, formData.idNumber, tenantId);

    if (existingCustomer) {
      clienteId = existingCustomer.id;
    } else if (searchError && isNoRowsError(searchError)) {
      const { data: newCustomer, error: insertCustomerError } =
        await insertCustomer(supabase, {
          tenant_id: tenantId,
          cedula: formData.idNumber,
          nombre_completo: formData.name,
          telefono: normalizedCustomerPhone,
          email: formData.email || null,
        });

      if (insertCustomerError) {
        throw new Error(
          `Error al crear cliente en ${CUSTOMER_TABLE}: ${getErrorMessage(insertCustomerError)}`,
        );
      }

      clienteId = newCustomer.id;
      isNewClient = true;

      await logAudit(supabase, {
        tipo: "cliente",
        accion: "crear",
        descripcion: `Nuevo cliente registrado: ${formData.name} (Cédula: ${formData.idNumber})`,
        usuario_nombre: "Sistema (Checkout)",
        meta: {
          customer_table: CUSTOMER_TABLE,
          tenant_id: tenantId,
          cedula: formData.idNumber,
          nombre: formData.name,
          telefono: formData.phone,
          telefono_normalizado: normalizedCustomerPhone,
          email: formData.email,
        },
      });
    } else if (searchError && isMissingTableError(searchError)) {
      throw new Error(
        "No se encontró la tabla public.clientes. Verifica que exista y esté en el schema cache.",
      );
    } else if (searchError) {
      throw new Error(
        `Error al buscar cliente en ${CUSTOMER_TABLE}: ${getErrorMessage(searchError)}`,
      );
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
        .eq("tenant_id", tenantId)
        .single();

      if (productError || !productData) {
        throw new Error(
          `No se pudo validar stock para el producto ${item.name || item.title || item.id}.`,
        );
      }

      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, attribute_value, stock_quantity")
        .eq("product_id", item.id)
        .eq("tenant_id", tenantId);

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
            normalizeVariantValue(variant.attribute_value) ===
            selectedVariantValue,
        );

        if (!matchedVariant) {
          throw new Error(
            `La variante "${item.variant}" ya no está disponible para ${productData.name}.`,
          );
        }

        const currentVariantStock = Number(matchedVariant.stock_quantity) || 0;
        if (currentVariantStock < quantity) {
          throw new Error(
            `Stock insuficiente en ${productData.name} (${matchedVariant.attribute_value}). Disponible: ${currentVariantStock}.`,
          );
        }

        const nextVariantStock = currentVariantStock - quantity;
        const { error: updateVariantError } = await supabase
          .from("product_variants")
          .update({ stock_quantity: nextVariantStock })
          .eq("id", matchedVariant.id)
          .eq("tenant_id", tenantId);

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
              : Number(variant.stock_quantity) || 0),
          0,
        );

        const { error: updateProductError } = await supabase
          .from("products")
          .update({ stock: Math.max(0, recalculatedTotalStock) })
          .eq("id", item.id)
          .eq("tenant_id", tenantId);

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
          .eq("id", item.id)
          .eq("tenant_id", tenantId);

        if (updateProductError) {
          throw new Error(
            `Error actualizando stock de ${productData.name}: ${updateProductError.message}`,
          );
        }
      }
    }

    // 3. Crear la Orden (Venta)
    const orderPayload = {
      tenant_id: tenantId,
      total,
      estado: "Pendiente",
      cliente_nombre: formData.name,
      ...(clienteId ? { cliente_id: clienteId } : {}),
    };

    const { data: newOrder, error: orderError } = await createOrderWithFallback(
      supabase,
      orderPayload,
    );

    if (orderError) {
      throw new Error(`Error al crear orden: ${getErrorMessage(orderError)}`);
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

    const normalizedOrderId =
      newOrder?.id !== undefined && newOrder?.id !== null
        ? String(newOrder.id)
        : null;

    return { success: true, orderId: normalizedOrderId };
  } catch (error) {
    console.error("Error en processCheckoutOrder:", error);
    return { success: false, error: error.message };
  }
}
