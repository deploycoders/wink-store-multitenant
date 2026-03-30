"use client";
import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteCategoryButton({ categoryId, categoryName }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Error al eliminar");
      }
      setShowModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 hover:bg-red-50 rounded-xl transition-all group"
        title="Eliminar categoría"
      >
        <Trash2 size={16} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => !loading && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-zinc-100">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-xl transition-all"
            >
              <X size={16} className="text-zinc-400" />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <AlertTriangle size={24} className="text-red-500" />
            </div>

            <h2 className="text-xl font-black text-ink mb-2 tracking-tight">
              Eliminar Categoría
            </h2>
            <p className="text-sm text-zinc-500 font-medium mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-bold text-ink">"{categoryName}"</span>?{" "}
              Las subcategorías perderán su categoría padre. Esta acción no se puede deshacer.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-widest text-zinc-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
