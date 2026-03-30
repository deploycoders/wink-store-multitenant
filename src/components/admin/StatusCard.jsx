// src/components/admin/StatusCard.jsx
import { ChevronRight, Target } from "lucide-react";

export function StatusCard({ title, value, progress, image, refNumber }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group max-w-95">
      {/* Imagen con Badge */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-ink">
            Operativa
          </span>
        </div>
      </div>

      {/* Cuerpo de la Card */}
      <div className="p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-honey" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">
              Identificador Operativo
            </p>
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-ink">
            {title}
          </h3>
          <p className="text-[10px] font-mono text-zinc-300 mt-1">
            REF: {refNumber}
          </p>
        </div>

        {/* Progress Bar Estilo Premium */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Alcance de Mercado
            </span>
            <span className="text-sm font-black italic text-honey">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-paper h-2 rounded-full overflow-hidden border border-zinc-100">
            <div
              className="bg-ink h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer de Card */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              Liquidez Generada
            </p>
            <p className="text-2xl font-black text-ink">
              <span className="text-honey mr-1">MX</span>${value}
            </p>
          </div>

          <button className="bg-ink text-white p-4 rounded-2xl hover:bg-honey hover:scale-110 transition-all shadow-lg shadow-zinc-200 group/btn">
            <ChevronRight
              size={24}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
