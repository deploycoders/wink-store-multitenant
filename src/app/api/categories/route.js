import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/categories
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, subcategories:categories!parent_id(*)")
    .is("parent_id", null)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// POST /api/categories
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, parent_id, image_url } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Nombre y slug son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, slug, parent_id: parent_id || null, image_url: image_url || null }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("API Error in POST /api/categories:", err);
    return NextResponse.json({ success: false, error: err.message || "Error interno" }, { status: 500 });
  }
}
