import React from "react";
import { Heart, Share2 } from "lucide-react";
import { Course } from "../types";

interface CourseCardProps {
  key?: string;
  course: Course;
  isWishlisted: boolean;
  onToggleWishlist: (courseId: string) => void;
  onViewDetails: (course: Course) => void;
  onShare?: (course: Course) => void;
}

export default function CourseCard({
  course,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
  onShare,
}: CourseCardProps) {
  // Safe helper to render price in Mozambique Metical (MT)
  const renderPrice = () => {
    if (course.price === 0) {
      return (
        <span className="text-sm font-bold text-emerald-600 font-mono" id={`price-free-${course.id}`}>
          Grátis
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1.5" id={`price-box-${course.id}`}>
        <span className="text-xs text-slate-400 line-through font-mono" id={`price-old-${course.id}`}>
          {Math.round(course.price * 1.5).toLocaleString("pt-PT")} MT
        </span>
        <span className="text-sm font-bold text-slate-800 font-mono" id={`price-new-${course.id}`}>
          {course.price.toLocaleString("pt-PT")} MT
        </span>
      </div>
    );
  };

  return (
    <div 
      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col group justify-between hover:border-teal-500/50 hover:shadow-md transition-all duration-200 shadow-2xs" 
      id={`course-card-root-${course.id}`}
    >
      {/* Top Banner and tag */}
      <div
        className="relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer"
        id={`card-banner-wrapper-${course.id}`}
        onClick={() => onViewDetails(course)}
      >
        <img 
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          referrerPolicy="no-referrer"
          id={`card-img-${course.id}`}
        />

        {/* Floating Category Tag */}
        <div 
          className="absolute top-3 left-3 bg-[#0a2540] text-white text-[9.5px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-md uppercase"
          id={`tag-${course.id}`}
        >
          {course.tag || course.category}
        </div>

        {/* Wishlist Button (Icon Only) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(course.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 cursor-pointer flex items-center justify-center hover:bg-white border border-slate-200/80 transition-colors z-10 shadow-xs"
          title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          id={`wishlist-btn-${course.id}`}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "text-rose-600 fill-rose-600" : "text-slate-400 hover:text-rose-500"
            }`} 
            id={`wishlist-icon-${course.id}`}
          />
        </button>

        {/* Share Button (Icon Only) */}
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(course);
            }}
            className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/95 cursor-pointer flex items-center justify-center hover:bg-white border border-slate-200/80 transition-colors text-slate-500 hover:text-[#0d9488] z-10 shadow-xs"
            title="Partilhar curso"
            id={`share-btn-${course.id}`}
          >
            <Share2 className="h-4 w-4" id={`share-icon-${course.id}`} />
          </button>
        )}
      </div>

      {/* Main Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between" id={`card-body-wrapper-${course.id}`}>
        <div className="text-left" id={`card-inner-text-${course.id}`}>
          {/* Instructor Block */}
          <div className="flex items-center gap-2 mb-2.5" id={`instructor-row-${course.id}`}>
            <div 
              className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-mono font-bold text-slate-700 flex items-center justify-center uppercase shrink-0"
              id={`instructor-avatar-${course.id}`}
            >
              {course.instructorAvatar || course.instructorName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-500 font-sans truncate" id={`instructor-name-${course.id}`}>
              {course.instructorName}
            </span>
          </div>

          {/* Title */}
          <h4 
            className="font-display font-bold text-base text-[#0a2540] leading-snug mb-3 line-clamp-2 min-h-[2.75rem] group-hover:text-[#0d9488] transition-colors cursor-pointer"
            id={`card-title-${course.id}`}
            onClick={() => onViewDetails(course)}
          >
            {course.title}
          </h4>

          {/* Course Metadata (Lessons and Rating without icons) */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans mb-4" id={`meta-row-${course.id}`}>
            <span className="font-mono font-bold text-slate-700">{course.lessonsCount} aulas</span>
            <span>•</span>
            <span className="font-mono text-slate-600">Avaliação {course.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* Footer actions: price + Details Button without icons */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between" id={`card-footer-${course.id}`}>
          <div id={`price-showcase-${course.id}`}>
            <div className="text-[9.5px] uppercase font-mono text-slate-400 leading-none mb-1">Valor</div>
            {renderPrice()}
          </div>

          <button
            onClick={() => onViewDetails(course)}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-[#0a2540] hover:text-white border border-slate-200 text-[#0a2540] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-sans"
            id={`details-link-${course.id}`}
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
