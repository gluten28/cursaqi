import React from "react";
import * as Icons from "lucide-react";
import { Category } from "../types";

interface CategoriesProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

// Map string references safely to Lucide Icon components
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  // @ts-ignore
  const IconComponent = Icons[name];
  if (!IconComponent) {
    return <Icons.BookOpen className={className} />;
  }
  return <IconComponent className={className} />;
}

export default function Categories({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoriesProps) {
  return (
    <section className="w-full py-10 bg-white border-b border-slate-100 px-4 md:px-8" id="cursaqi-categories-section">
      <div className="w-full max-w-7xl mx-auto" id="categories-container">
        {/* Section Heading */}
        <div className="text-center mb-10 flex flex-col items-center" id="categories-heading-wrap">
          <h2 className="font-display text-2xl md:text-3.5xl font-bold text-[#0a2540] tracking-tight animate-fade-in" id="categories-title">
            Categorias em Destaque
          </h2>
          <div className="w-12 h-[3px] bg-[#0d9488] mt-2.5" id="categories-underline-accent" />
          <p className="text-slate-500 text-sm mt-3.5 font-sans max-w-md" id="categories-description">
            Filtre instantaneamente os planos de estudo disponíveis clicando abaixo para se especializar nas diferentes áreas técnicas e criativas.
          </p>
        </div>

        {/* Categories Grid Setup */}
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5" 
          id="categories-grid-root"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`flex items-center gap-4 p-4 text-left border rounded-sm transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#0d9488] border-[#0d9488] text-white shadow-xs"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-[#0a2540] hover:border-slate-200"
                }`}
                id={`category-pill-${cat.id}`}
              >
                {/* Monochromatic icon wrapping */}
                <div 
                  className={`p-2.5 rounded-sm flex items-center justify-center ${
                    isSelected ? "bg-white/10 text-white" : "bg-white text-slate-600 border border-slate-100"
                  }`} 
                  id={`category-icon-box-${cat.id}`}
                >
                  <CategoryIcon name={cat.iconName} className="h-5 w-5" />
                </div>

                <div className="flex flex-col" id={`category-text-${cat.id}`}>
                  <span className="font-semibold text-sm font-sans tracking-tight" id={`category-name-${cat.id}`}>
                    {cat.name}
                  </span>
                  <span 
                    className={`text-xs ${isSelected ? "text-teal-100" : "text-slate-400"} font-mono mt-0.5`}
                    id={`category-count-${cat.id}`}
                  >
                    {cat.count} Cursos
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Reset Quick Bar */}
        {selectedCategoryId && (
          <div className="mt-8 flex justify-center animate-fade-in" id="categories-active-filter-bar">
            <button
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#0d9488] text-xs font-semibold uppercase tracking-wider text-[#0d9488] hover:bg-teal-50 rounded-sm cursor-pointer transition-colors"
              id="reset-filter-btn"
            >
              <span>Exibindo Apenas Categoria Selecionada. Limpar Filtro</span>
              <Icons.X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
