import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      short_description,
      description, 
      price, 
      discount_price,
      stock, 
      images, 
      category_ids = [],
      subcategory_id,
      status, 
      featured,
      slug,
      variants = []
    } = body;

    const supabase = await createClient();
    
    // 1. Actualizar el producto
    const { data: product, error: pError } = await supabase
      .from("products")
      .update({
        name,
        short_description,
        description,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: parseInt(stock),
        images: images || [],
        subcategory_id: subcategory_id || null,
        status,
        featured,
        slug
      })
      .eq("id", id)
      .select()
      .single();

    if (pError) throw pError;

    // 2. Sincronizar categorías (product_categories)
    if (category_ids) {
      // Borrar anteriores
      await supabase.from("product_categories").delete().eq("product_id", id);
      
      // Insertar nuevas
      const finalCategoryIds = category_ids;
      if (finalCategoryIds.length > 0) {
        const pcToInsert = finalCategoryIds.map(catId => ({
          product_id: id,
          category_id: catId
        }));
        await supabase.from("product_categories").insert(pcToInsert);
      }
    }

    // 3. Refrescar variantes (borrar y re-insertar para simplicidad)
    if (variants) {
      // Borrar anteriores
      await supabase.from("product_variants").delete().eq("product_id", id);
      
      // Insertar nuevas si las hay
      if (variants.length > 0) {
        const variantsToInsert = variants.map(v => ({
          product_id: id,
          name: v.name,
          value: v.value,
          price_adjustment: parseFloat(v.price_adjustment) || 0,
          stock_adjustment: parseInt(v.stock_adjustment) || 0
        }));
        await supabase.from("product_variants").insert(variantsToInsert);
      }
    }

    if (pError) throw pError;
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
