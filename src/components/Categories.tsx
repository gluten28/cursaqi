import React from "react";
import { Category } from "../types";

interface CategoriesProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Categories({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoriesProps) {
  return (
    <section className="w-full py-8 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 text-left shadow-2xs" id="cursaqi-categories-section">
      <div className="w-full" id="categories-container">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-5 mb-6" id="categories-heading-wrap">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0d9488] uppercase block mb-1">
              Áreas de Formação
            </span>
            <h2 className="font-display text-2xl font-bold text-[#0a2540] tracking-tight" id="categories-title">
              Categorias em Destaque
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-sans max-w-xl" id="categories-description">
              Selecione uma especialidade abaixo para filtrar os cursos disponíveis e direcionar a sua aprendizagem.
            </p>
          </div>

          {selectedCategoryId && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-mono font-bold text-[#0d9488] hover:text-[#0f766e] uppercase tracking-wider underline cursor-pointer self-start sm:self-auto"
            >
              Mostrar Todas as Categorias
            </button>
          )}
        </div>

        {/* Categories Grid Setup without any icons */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" 
          id="categories-grid-root"
        >
          {categories.map((cat, index) => {
            const isSelected = selectedCategoryId === cat.id;
            const indexStr = String(index + 1).padStart(2, "0");

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`flex flex-col justify-between p-4 text-left border rounded-xl transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#0d9488] border-[#0d9488] text-white shadow-xs"
                    : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-[#0a2540]"
                }`}
                id={`category-pill-${cat.id}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-wider ${
                    isSelected ? "text-teal-100" : "text-[#0d9488]"
                  }`}>
                    {indexStr}
                  </span>
                  <span 
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                    id={`category-count-${cat.id}`}
                  >
                    {cat.count} {cat.count === 1 ? "curso" : "cursos"}
                  </span>
                </div>

                <span className="font-bold text-xs sm:text-sm font-sans tracking-tight" id={`category-name-${cat.id}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
