import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/products
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id, categories(name)), product_variants(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      short_description,
      description, 
      price, 
      discount_price,
      stock, 
      images, 
      category_ids = [], // Array de categorías para la tabla pivot
      subcategory_id,
      status, 
      featured,
      slug,
      variants = []
    } = body;

    if (!name || !price || category_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nombre, precio y al menos una categoría son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 1. Insertar el producto
    const { data: product, error: pError } = await supabase
      .from("products")
      .insert([
        {
          name,
          short_description,
          description,
          price: parseFloat(price),
          discount_price: discount_price ? parseFloat(discount_price) : null,
          stock: parseInt(stock) || 0,
          images: images || [],
          subcategory_id: subcategory_id || null,
          status: status || "draft",
          featured: featured || false,
          slug: slug || name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
        },
      ])
      .select()
      .single();

    if (pError) throw pError;
    const productId = product.id;

    // 2. Insertar categorías en la tabla pivot (product_categories)
    const finalCategoryIds = category_ids;
    
    if (finalCategoryIds.length > 0) {
      const pcToInsert = finalCategoryIds.map(catId => ({
        product_id: productId,
        category_id: catId
      }));
      const { error: pcError } = await supabase.from("product_categories").insert(pcToInsert);
      if (pcError) console.error("Error inserting product categories:", pcError);
    }

    // 3. Insertar variantes si existen
    if (variants.length > 0) {
      const variantsToInsert = variants.map(v => ({
        product_id: productId,
        name: v.name,
        value: v.value,
        price_adjustment: parseFloat(v.price_adjustment) || 0,
        stock_adjustment: parseInt(v.stock_adjustment) || 0
      }));

      const { error: vError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (vError) console.error("Error inserting variants:", vError);
      // No lanzamos error para no fallar la creación del producto si solo fallan las variantes
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
