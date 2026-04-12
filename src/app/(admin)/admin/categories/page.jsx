"use client";
import React, { useState, useEffect } from "react";
import {
  Tags,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Wrench,
  Utensils,
  CheckCircle2,
  LayoutGrid,
  List,
  Store,
  X,
} from "lucide-react";
import {
  getTenantConfig,
  updateTenantStoreType,
} from "@/app/actions/public/tenantActions";

// Tipos de tienda predefinidos que coinciden con tu SQL
const STORE_TYPES = [
  {
    id: "clothing",
    name: "Tienda de Ropa",
    icon: <ShoppingBag size={20} />,
    color: "bg-slate-500",
  },
  {
    id: "hardware_store",
    name: "Ferretería",
    icon: <Wrench size={20} />,
    color: "bg-orange-500",
  },
  {
    id: "restaurant",
    name: "Restaurante / Comida",
    icon: <Utensils size={20} />,
    color: "bg-red-500",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(""); // Estado para el nicho seleccionado
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isStoreTypeModalOpen, setIsStoreTypeModalOpen] = useState(false);
  const [storeTypeSearchTerm, setStoreTypeSearchTerm] = useState("");
  const [storeTypeViewMode, setStoreTypeViewMode] = useState("grid"); // "grid" o "list"

  // ... dentro de CategoriesPage
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const result = await getTenantConfig();

        console.log("Configuración cargada:", result); // <--- REVISA ESTO EN LA CONSOLA

        if (result.success && result.data) {
          // Guardamos el ID en el estado local
          setTenantId(result.data.tenant_id);
          setSelectedType(result.data.store_type);

          if (result.data.store_type) {
            await fetchCategories(result.data.store_type);
          }
        }
      } catch (e) {
        console.error("Error cargando configuración:", e);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleTypeSelection = async (typeId) => {
    // Si salta esta alerta, es porque result.data.tenant_id llegó vacío en el useEffect
    if (!tenantId) {
      alert("Error: No se encontró el ID de la tienda en el estado local.");
      return;
    }

    try {
      setLoading(true);
      // Pasamos ambos valores a la Server Action
      const result = await updateTenantStoreType(typeId, tenantId);

      if (!result.success) throw new Error(result.error);

      setSelectedType(typeId);
      await fetchCategories(typeId);
      setIsStoreTypeModalOpen(false);
    } catch (error) {
      alert("No se pudo guardar la preferencia");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtrado por store_type (Catálogo Maestro)
  const fetchCategories = async (type) => {
    if (!type) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?store_type=${type}`);
      const result = await response.json();

      console.log("Datos recibidos de la API:", result); // <--- AÑADE ESTO

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al cargar catálogo");
      }
      setCategories(result.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStoreTypes = STORE_TYPES.filter((type) =>
    type.name.toLowerCase().includes(storeTypeSearchTerm.toLowerCase()),
  );

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Catálogo Maestro
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Revisa las categorías predeterminadas o cambia el nicho principal.
          </p>
        </div>
        <button
          onClick={() => setIsStoreTypeModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none"
        >
          <Store size={16} />
          {selectedType ? "CAMBIAR NICHO" : "ELEGIR NICHO"}
        </button>
      </header>

      {/* Buscador */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar en el catálogo seleccionado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Tabla de Resultados (Solo Lectura) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Categoría / Estructura
              </th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">
                Estado del Sistema
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2
                      className="animate-spin text-slate-400"
                      size={32}
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Sincronizando Catálogo...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleExpand(category.id)}
                          className="p-1 text-slate-400 hover:text-slate-900"
                          disabled={!category.subcategories?.length}
                          style={{
                            opacity: category.subcategories?.length ? 1 : 0.2,
                          }}
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-slate-900 dark:text-white">
                          {category.name.charAt(0)}
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
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-500/20">
                        <Tags size={10} /> Oficial
                      </span>
                    </td>
                  </tr>

                  {/* Subcategorías */}
                  {expandedCategories[category.id] &&
                    category.subcategories?.map((sub) => (
                      <tr
                        key={sub.id}
                        className="bg-slate-50/30 dark:bg-slate-800/20"
                      >
                        <td className="px-6 py-3 pl-20" colSpan={2}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div>
                              <p className="font-bold text-slate-600 dark:text-slate-400 text-xs">
                                {sub.name}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                /{sub.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-12 text-center text-slate-400 font-medium"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Tags
                      size={20}
                      className="text-slate-300 dark:text-slate-600"
                    />
                    <span>
                      {selectedType
                        ? "No hay categorías en este nicho."
                        : "Haz clic en 'Elegir Nicho' para ver el catálogo."}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Elegir Nicho */}
      {isStoreTypeModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xl transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl relative border border-white/20 dark:border-slate-700/50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header de la Modal */}
            <div className="p-8 pb-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-500/20">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                    Elegir Tipo de Tienda
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">
                    Selecciona tu nicho para ver el catálogo
                  </p>
                </div>
              </div>

              {/* Botón Cerrar y Vistas */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setStoreTypeViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      storeTypeViewMode === "grid"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setStoreTypeViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      storeTypeViewMode === "list"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setIsStoreTypeModalOpen(false)}
                  className="rounded-xl p-3 ml-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Buscador dentro de la modal */}
            <div className="px-8 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar tipo de tienda..."
                  value={storeTypeSearchTerm}
                  onChange={(e) => setStoreTypeSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-slate-900 dark:focus:border-slate-900 focus:ring-0 outline-none font-bold text-sm transition-all"
                />
              </div>
            </div>

            {/* Listado de Nichos */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
              {filteredStoreTypes.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    No se encontraron tipos de tienda.
                  </span>
                </div>
              ) : (
                <div
                  className={
                    storeTypeViewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {filteredStoreTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelection(type.id)}
                      className={
                        storeTypeViewMode === "grid"
                          ? `relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 cursor-pointer group ${
                              selectedType === type.id
                                ? "border-slate-900 bg-slate-100 dark:bg-slate-500/10 text-slate-900 dark:text-slate-400 shadow-xl shadow-slate-500/10"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700/50 hover:shadow-lg"
                            }`
                          : `relative p-4 px-6 rounded-2xl border-2 transition-all flex flex-row items-center gap-4 cursor-pointer group ${
                              selectedType === type.id
                                ? "border-slate-900 bg-slate-100 dark:bg-slate-500/10 text-slate-900 dark:text-slate-400 shadow-xl shadow-slate-500/10"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700/50 hover:shadow-lg"
                            }`
                      }
                    >
                      {selectedType === type.id && (
                        <CheckCircle2
                          className={
                            storeTypeViewMode === "grid"
                              ? "absolute top-4 right-4 text-slate-900 dark:text-slate-400"
                              : "absolute right-6 text-slate-900 dark:text-slate-400"
                          }
                          size={18}
                        />
                      )}
                      <div
                        className={`p-4 rounded-[1.25rem] ${
                          selectedType === type.id
                            ? "bg-slate-100 dark:bg-slate-500/20 text-slate-900 dark:text-slate-400"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        {type.icon}
                      </div>
                      <span
                        className={
                          storeTypeViewMode === "grid"
                            ? "font-black text-xs uppercase tracking-widest text-center"
                            : "font-black text-sm uppercase tracking-widest"
                        }
                      >
                        {type.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
