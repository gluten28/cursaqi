import React from "react";
import { Heart, BookOpen, Star, ArrowRight, Share2 } from "lucide-react";
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
        <span className="text-sm font-bold text-emerald-600 font-mono animate-fade-in" id={`price-free-${course.id}`}>
          Grátis
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1.5 animate-fade-in" id={`price-box-${course.id}`}>
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
      className="bg-white border border-slate-100 rounded-sm overflow-hidden flex flex-col group justify-between hover:border-slate-300 transition-all duration-150 shadow-xs" 
      id={`course-card-root-${course.id}`}
    >
      {/* Top Banner and tag */}
      <div
        className="relative w-full aspect-video bg-slate-100 overflow-hidden cursor-pointer"
        id={`card-banner-wrapper-${course.id}`}
        onClick={() => onViewDetails(course)}
      >
        <img 
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-102"
          referrerPolicy="no-referrer"
          id={`card-img-${course.id}`}
        />

        {/* Floating Category Tag */}
        <div 
          className="absolute top-3 left-3 bg-[#0a2540] text-white text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-xs uppercase"
          id={`tag-${course.id}`}
        >
          {course.tag}
        </div>

        {/* Dynamic Wishlist Heart (Flat solid red icon only when wishlisted, flat slate otherwise) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(course.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 cursor-pointer flex items-center justify-center hover:bg-white border border-slate-100 transition-colors z-10"
          title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          id={`wishlist-btn-${course.id}`}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "text-rose-600 fill-rose-600" : "text-slate-400"
            }`} 
            id={`wishlist-icon-${course.id}`}
          />
        </button>

        {/* Dynamic Share Button */}
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(course);
            }}
            className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/90 cursor-pointer flex items-center justify-center hover:bg-white border border-slate-100 transition-colors text-slate-500 hover:text-[#0d9488] z-10"
            title="Partilhar curso nas redes sociais"
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
          <div className="flex items-center gap-2 mb-3" id={`instructor-row-${course.id}`}>
            <div 
              className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 flex items-center justify-center uppercase"
              id={`instructor-avatar-${course.id}`}
            >
              {course.instructorAvatar || course.instructorName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-500 font-sans" id={`instructor-name-${course.id}`}>
              {course.instructorName}
            </span>
          </div>

          {/* Heading */}
          <h4 
            className="font-display font-bold text-base text-[#0a2540] leading-tight mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-[#0d9488] transition-colors cursor-pointer hover:text-[#0d9488]"
            id={`card-title-${course.id}`}
            onClick={() => onViewDetails(course)}
          >
            {course.title}
          </h4>

          {/* Course Metadata Row (Lessons + Rating) */}
          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-4" id={`meta-row-${course.id}`}>
            <div className="flex items-center gap-1" id={`lessons-badge-${course.id}`}>
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-mono">{course.lessonsCount} Aulas</span>
            </div>
            <div className="flex items-center gap-1" id={`rating-badge-${course.id}`}>
              <Star className="h-3.5 w-3.5 text-slate-400 fill-slate-300 stroke-slate-400" />
              <span className="font-mono text-slate-600 font-semibold">{course.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions: price + Details Button */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between" id={`card-footer-${course.id}`}>
          <div id={`price-showcase-${course.id}`}>
            <div className="text-[10px] uppercase font-mono text-slate-400 leading-none mb-1">Valor</div>
            {renderPrice()}
          </div>

          <button
            onClick={() => onViewDetails(course)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors uppercase tracking-wider cursor-pointer font-sans"
            id={`details-link-${course.id}`}
          >
            <span>Ver Detalhes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
