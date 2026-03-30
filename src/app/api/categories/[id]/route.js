import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/categories/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, subcategories:categories!parent_id(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}

// PUT /api/categories/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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
      .update({ name, slug, parent_id: parent_id || null, image_url: image_url || null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
