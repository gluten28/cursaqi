import React, { useState } from "react";
import { Search, Heart, Clock, PlaySquare, BookOpen, Sparkles, SlidersHorizontal, Share2 } from "lucide-react";
import { Course, Category, CourseVideo } from "../types";

interface CoursesCatalogViewProps {
  courses: Course[];
  categories: Category[];
  videos: CourseVideo[];
  onViewCourseDetails: (course: Course) => void;
  favorites: string[];
  onToggleWishlist: (courseId: string) => void;
  onShareCourse?: (course: Course) => void;
}

export default function CoursesCatalogView({
  courses,
  categories,
  videos,
  onViewCourseDetails,
  favorites,
  onToggleWishlist,
  onShareCourse,
}: CoursesCatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  // Dynamic calculations for each course
  const getCourseVideoStats = (courseId: string, lessonsCount: number) => {
    const courseVids = videos.filter((v) => v.courseId === courseId);
    if (courseVids.length === 0) {
      const estimatedMinutes = lessonsCount * 18;
      const h = Math.floor(estimatedMinutes / 60);
      const m = estimatedMinutes % 60;
      return {
        durationText: h > 0 ? `${h}h ${m}m` : `${m} min`,
        modulesCount: lessonsCount || 8,
      };
    }

    // Sum up duration strings of format MM:SS or HH:MM:SS (strictly numeric sum)
    let totalSeconds = 0;
    courseVids.forEach((v) => {
      const parts = v.duration.split(":").map(Number);
      if (parts.length === 3) {
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        totalSeconds += parts[0] * 60;
      }
    });

    const totalMinutes = Math.floor(totalSeconds / 60) || (lessonsCount * 12);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      durationText: h > 0 ? `${h}h ${m}m` : `${totalMinutes} min`,
      modulesCount: courseVids.length,
    };
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = activeCategory ? c.category === activeCategory : true;
    
    // Search query matches title, instructor or tags
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query
      ? c.title.toLowerCase().includes(query) ||
        c.instructorName.toLowerCase().includes(query) ||
        c.tag.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      : true;

    // Price query
    let matchesPrice = true;
    if (priceFilter === "free") {
      matchesPrice = c.price === 0;
    } else if (priceFilter === "paid") {
      matchesPrice = c.price > 0;
    }

    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-10 px-4" id="catalog-view">
      <div className="w-full max-w-7xl mx-auto space-y-8" id="catalog-wrapper">
        
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-left shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="catalog-header-block">
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl md:text-3.5xl text-[#0a2540] tracking-tight">
              Catálogo de Cursos de Informática
            </h2>
            <div className="w-12 h-[3px] bg-[#0d9488]" />
            <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-xl">
              Pesquise, filtre e explore todos os cursos de Informática e Tecnologia do Formador Aldo Valige. 
              Consulte tempos de duração e módulos práticos estruturados para o seu aprendizado.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm text-center font-mono self-stretch md:self-auto flex flex-col justify-center" id="catalog-counter-card">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cursos Disponíveis</span>
            <span className="text-2xl font-bold text-[#0d9488] block mt-1">{filteredCourses.length} de {courses.length}</span>
          </div>
        </div>

        {/* Dynamic Interactive Filter Toolbar */}
        <div className="bg-white border border-slate-200 p-6 rounded-sm flex flex-col gap-4 text-left" id="catalog-toolbar">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center" id="catalog-fields-row">
            {/* Search Input field */}
            <div className="md:col-span-6 relative" id="catalog-search-col">
              <input
                type="text"
                placeholder="Pesquisar por designação de curso, formador ou palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm text-sm focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488]"
                id="catalog-search-field"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Price Type Select */}
            <div className="md:col-span-3 flex items-center gap-2" id="catalog-price-filter-col">
              <span className="text-xs font-semibold text-slate-500 font-sans shrink-0 uppercase tracking-wide">Modalidade:</span>
              <select
                value={priceFilter}
                onChange={(e: any) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-sm text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488]"
                id="catalog-price-select"
              >
                <option value="all">Filtro: Todos Cursos</option>
                <option value="free">Somente Grátis</option>
                <option value="paid">Somente Pagos</option>
              </select>
            </div>

            {/* Clear Filters Action Button */}
            <div className="md:col-span-3 flex justify-end" id="catalog-clear-action-col">
              {(activeCategory || searchQuery || priceFilter !== "all") && (
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery("");
                    setPriceFilter("all");
                  }}
                  className="w-full md:w-auto text-center px-4 py-2.5 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer font-sans"
                  id="catalog-reset-filters"
                >
                  Limpar Todos Filtros
                </button>
              )}
            </div>
          </div>

          {/* Categories select row scrollbar */}
          <div className="border-t border-slate-100 pt-4" id="catalog-categories-bar">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-2.5">Filtrar por Área de Informática:</span>
            <div className="flex flex-wrap gap-2" id="catalog-categories-list">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  activeCategory === null
                    ? "bg-[#0d9488] text-white border-[#0d9488]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                Todas as Áreas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#0d9488] text-white border-[#0d9488]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Course Catalog Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-sm space-y-4" id="catalog-empty">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">Nenhum curso corresponde aos critérios de pesquisa</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Experimente ajustar o termo de pesquisa ou selecionar outra categoria de filtros no painel interactivo superior.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-grid">
            {filteredCourses.map((c) => {
              const { durationText, modulesCount } = getCourseVideoStats(c.id, c.lessonsCount);
              const isFav = favorites.includes(c.id);

              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-sm hover:border-slate-400 transition-colors flex flex-col justify-between shadow-2xs group text-left relative overflow-hidden"
                  id={`catalog-card-${c.id}`}
                >
                  {/* Decorative Flat Corner Tag for price */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-xs border shadow-2xs ${
                      c.price === 0 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {c.price === 0 ? "Gratuito" : "Pago"}
                    </span>
                  </div>

                  {/* Favorite toggle absolute widget */}
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(c.id)}
                    className="absolute top-3 right-3 z-10 w-7 h-7 rounded-sm bg-white/90 border border-slate-200 flex items-center justify-center cursor-pointer shadow-3xs text-slate-400 hover:text-rose-600 transition-colors"
                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "fill-rose-600 text-rose-600" : ""}`} />
                  </button>

                  {/* Share course button */}
                  {onShareCourse && (
                    <button
                      type="button"
                      onClick={() => onShareCourse(c)}
                      className="absolute top-3 right-11 z-10 w-7 h-7 rounded-sm bg-white/90 border border-slate-200 flex items-center justify-center cursor-pointer shadow-3xs text-slate-500 hover:text-[#0d9488] transition-colors"
                      title="Partilhar este curso"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Capa do curso */}
                  <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-500"
                    />
                  </div>

                  {/* Meta Details layout inside card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#0d9488] font-bold uppercase tracking-widest leading-none">
                          {c.tag}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.enrolledStudentsCount.toLocaleString()} inscritos
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-[#0a2540] tracking-tight group-hover:text-[#0d9488] transition-colors line-clamp-2 min-h-[2.75rem]">
                        {c.title}
                      </h3>

                      {/* Descricao Resumida (Short description truncated) */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
                        {c.description}
                      </p>
                    </div>

                    {/* Stats bar line: tempo de video, numero de modulo */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xs grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 font-sans">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Duração: <strong className="text-slate-800 font-bold">{durationText}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3.5 shrink-0">
                        <PlaySquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Módulos: <strong className="text-slate-800 font-bold">{modulesCount}</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-400 leading-none">Matrícula</span>
                        <span className="font-mono text-xs font-black text-slate-900 mt-1">
                          {c.price === 0 ? "ACESSO LIVRE" : `${c.price.toLocaleString("pt-PT")} MT`}
                        </span>
                      </div>

                      {/* DETAILS BTN: opens individual course details view */}
                      <button
                        onClick={() => onViewCourseDetails(c)}
                        className="bg-[#0a2540] hover:bg-[#0d9488] text-white rounded-xs px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center font-sans shadow-2xs"
                        id={`btn-details-${c.id}`}
                      >
                        Detalhes
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
