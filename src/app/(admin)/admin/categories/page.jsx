"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Tags,
  FolderTree,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "No se pudieron cargar categorías");
      }
      setCategories(result.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Categorías
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestiona la estructura jerárquica de productos.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex cursor-pointer items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none"
        >
          <Plus size={16} />
          NUEVA CATEGORÍA
        </button>
      </header>

      {/* Barra de Búsqueda Estándar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Categoría / Slug
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hidden md:table-cell">
                Subcategorías
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2
                      className="animate-spin text-slate-300"
                      size={24}
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Cargando catálogo...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Categoría Raíz */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpand(category.id)}
                          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                          disabled={!category.subcategories?.length}
                          style={{
                            opacity: category.subcategories?.length ? 1 : 0.3,
                          }}
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                          <FolderTree size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                            {category.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {category.subcategories?.length || 0} Subcategoria
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Subcategorías (Anidadas) */}
                  {expandedCategories[category.id] &&
                    category.subcategories?.map((sub) => (
                      <tr
                        key={sub.id}
                        className="bg-slate-50/20 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-l-2 border-slate-100 dark:border-slate-700/50"
                      >
                        <td className="px-6 py-3 pl-12">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                            <div>
                              <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                                {sub.name}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                /{sub.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <span className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase">
                            Subcategoría
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditModal(sub)}
                              className="p-1.5 cursor-pointer text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm dark:shadow-none"
                            >
                              <Edit size={14} />
                            </button>
                            <DeleteCategoryButton
                              categoryId={sub.id}
                              categoryName={sub.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <span className="text-sm font-medium text-slate-400">
                    No se encontraron categorías.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Reutilizable de Categorías */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xl transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl relative border border-white/20 dark:border-slate-700/50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header del Modal */}
            <div className="p-8 pb-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none">
                  <Tags size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                    {modalMode === "edit"
                      ? "Editar Categoría"
                      : "Nueva Categoría"}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">
                    Estructura y Clasificación de Productos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-300 dark:text-slate-500 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <CategoryForm
                initialData={selectedCategory}
                parentCategories={categories}
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchCategories();
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
