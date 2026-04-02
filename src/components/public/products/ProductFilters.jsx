"use client";

import {
  Search,
  X,
  LayoutGrid,
  Square,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ProductFilters({
  categories,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const scrollRef = useRef(null);

  // Lógica de scroll manual
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.4
          : scrollLeft + clientWidth * 0.4;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="space-y-8 mb-12">
      {/* Controles Superiores: Búsqueda + Selector de Vista */}
      <div className="flex flex-col md:flex-row gap-6 items-center max-w-4xl mx-auto">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-honey-dark">
            <Search size={18} strokeWidth={1.5} />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="¿Qué buscas hoy?"
            className="w-full bg-paper border border-honey-light/50 rounded-full h-14 pl-14 pr-12 text-sm focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/5 transition-all shadow-sm placeholder:text-honey-dark/50"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute inset-y-0 right-5 flex items-center text-honey-dark hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 bg-paper border border-honey-light/50 p-1.5 rounded-full shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-full transition-all ${
              viewMode === "grid"
                ? "bg-ink text-paper shadow-md"
                : "text-honey-dark hover:text-ink"
            }`}
            title="Vista Catálogo"
          >
            <LayoutGrid size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`p-2.5 rounded-full transition-all ${
              viewMode === "gallery"
                ? "bg-ink text-paper shadow-md"
                : "text-honey-dark hover:text-ink"
            }`}
            title="Vista Galería"
          >
            <Square size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Carrusel de Categorías (Slider) */}
      <div className="relative max-w-5xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto justify-center gap-2 md:gap-3 pb-4 no-scrollbar scroll-smooth mask-horizontal"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap px-5 cursor-pointer py-2.5 md:px-8 md:py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
              activeCategory === "all"
                ? "bg-ink text-paper border-ink shadow-lg shadow-ink/20"
                : "bg-paper text-honey-dark border-honey-light/50 hover:border-ink hover:text-ink"
            }`}
          >
            Todo
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap cursor-pointer px-5 py-2.5 md:px-8 md:py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat.id
                  ? "bg-ink text-paper border-ink shadow-lg shadow-ink/20"
                  : "bg-paper text-honey-dark border-honey-light/50 hover:border-ink hover:text-ink"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Controles de Navegación Centralizados Abajo */}
        <div className="flex justify-center items-center gap-3 md:gap-4 mt-2 md:mt-4 md:hidden lg:flex">
          <button
            onClick={() => scroll("left")}
            className="p-2.5 md:p-3 bg-paper border-2 border-honey-light text-ink rounded-full shadow-md hover:bg-ink hover:text-paper hover:border-ink transition-all active:scale-95"
            title="Anterior"
          >
            <ChevronLeft
              className="w-4 h-4 md:w-4.5 md:h-4.5"
              strokeWidth={2}
            />
          </button>
          <div className="w-8 md:w-12 h-0.5 bg-honey-light rounded-full opacity-50" />
          <button
            onClick={() => scroll("right")}
            className="p-2.5 md:p-3 bg-paper border-2 border-honey-light text-ink rounded-full shadow-md hover:bg-ink hover:text-paper hover:border-ink transition-all active:scale-95"
            title="Siguiente"
          >
            <ChevronRight
              className="w-4 h-4 md:w-4.5 md:h-4.5"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
