import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { PromoBanner, Course } from "../types";

interface BannerCarouselProps {
  banners: PromoBanner[];
  courses?: Course[];
  onActionClick?: () => void;
  onCourseClick?: (course: Course) => void;
}

export default function BannerCarousel({
  banners,
  courses = [],
  onActionClick,
  onCourseClick,
}: BannerCarouselProps) {
  // Only display banners that are active and have an image URL
  const activeBanners = banners.filter((b) => b.isActive && b.imageUrl);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play logic
  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeBanners.length, isHovered]);

  if (activeBanners.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  /** Resolve the linked course for a banner, if any */
  const getLinkedCourse = (banner: PromoBanner): Course | null => {
    if (!banner.courseId) return null;
    return courses.find((c) => c.id === banner.courseId) || null;
  };

  /** Handle CTA button click — open linked course or fall back to scroll */
  const handleBannerAction = (banner: PromoBanner, e: React.MouseEvent) => {
    e.stopPropagation();
    const linked = getLinkedCourse(banner);
    if (linked && onCourseClick) {
      onCourseClick(linked);
    } else if (onActionClick) {
      onActionClick();
    }
  };

  const currentBanner = activeBanners[currentIndex];
  const linkedCourse = getLinkedCourse(currentBanner);

  return (
    <div
      className="w-full h-full flex flex-col justify-between rounded-2xl bg-[#061528] border border-slate-800 shadow-xl overflow-hidden group p-4 sm:p-5 text-left relative transition-all duration-300 hover:border-teal-500/40"
      id="cursaqi-slide-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Slide Layout: Square image on left, texts and buttons on right */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 z-10 my-auto">
        
        {/* Left Side: Square Image Container */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 aspect-square shrink-0 rounded-xl overflow-hidden bg-[#0a2540] border-2 border-teal-500/30 shadow-md relative group-hover:border-teal-400 transition-colors">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          {/* Badge over square image */}
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 bg-[#0d9488]/90 text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              {linkedCourse ? linkedCourse.tag || "Destaque" : "Destaque"}
            </span>
          </div>
        </div>

        {/* Right Side: Texts and Action Buttons */}
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-teal-400 font-bold bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-md">
              Slide {currentIndex + 1} de {activeBanners.length}
            </span>
            {linkedCourse && (
              <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                {linkedCourse.price === 0 ? "Grátis" : `${linkedCourse.price.toLocaleString("pt-PT")} MT`}
              </span>
            )}
          </div>

          {currentBanner.title && (
            <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-white leading-tight drop-shadow-sm">
              {currentBanner.title}
            </h2>
          )}

          {currentBanner.subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed line-clamp-2">
              {currentBanner.subtitle}
            </p>
          )}

          {/* Linked course preview chip */}
          {linkedCourse && (
            <div className="text-[11px] text-slate-300 font-sans truncate">
              <span className="text-slate-400">Curso: </span>
              <strong className="text-white">{linkedCourse.title}</strong>
              <span className="text-slate-400"> • {linkedCourse.lessonsCount} aulas</span>
            </div>
          )}

          {/* Actions Button & Slider navigation */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={(e) => handleBannerAction(currentBanner, e)}
              className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] active:bg-[#0d9488] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg shadow-lg hover:shadow-teal-900/40 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>{currentBanner.buttonText || (linkedCourse ? "Ver Curso" : "Explorar")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Slider controls (prev/next) */}
            {activeBanners.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  title="Slide Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  title="Próximo Slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pagination Dots at bottom */}
      {activeBanners.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-3 z-10">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleDotClick(index, e)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "w-6 bg-[#0d9488]" : "w-1.5 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
