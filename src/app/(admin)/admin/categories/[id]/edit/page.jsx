import { getCategoryById, getAllCategoriesFlat } from "@/services/categories";
import CategoryForm from "@/components/admin/CategoryForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;

  const [category, allCategories] = await Promise.all([
    getCategoryById(id),
    getAllCategoriesFlat(),
  ]);

  if (!category) notFound();

  // Parent candidates: root categories only, excluding self
  const parentCategories = allCategories.filter(
    (c) => !c.parent_id && c.id !== id
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="flex items-center gap-1 text-zinc-400 hover:text-ink transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={14} />
          Categorías
        </Link>
      </div>

      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-ink">
          Editar Categoría
        </h1>
        <p className="text-zinc-400 font-medium mt-1 text-sm">
          Actualizando: <span className="font-bold text-ink">{category.name}</span>
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 max-w-2xl">
        <CategoryForm
          initialData={category}
          parentCategories={parentCategories}
        />
      </div>
    </div>
  );
}
