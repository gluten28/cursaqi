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
    }, 5000);

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

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4"
      id="platform-banner-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg group bg-[#060f1e] border border-slate-800 transition-all duration-300"
        id="carousel-slider-wrapper"
      >
        {/* Slides Track */}
        <div className="w-full relative" id="carousel-slides-track">
          {activeBanners.map((banner, index) => {
            const isSelected = index === currentIndex;
            const linkedCourse = getLinkedCourse(banner);

            return (
              <div
                key={banner.id}
                className={`transition-all duration-700 ease-in-out ${
                  isSelected
                    ? "opacity-100 z-10 relative"
                    : "opacity-0 absolute inset-0 z-0 pointer-events-none"
                }`}
                id={`carousel-slide-${banner.id}`}
              >
                {/* Full image — no crop, full visibility */}
                <div className="w-full bg-[#060f1e] flex items-center justify-center">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full max-h-[420px] object-contain select-none"
                    style={{ display: "block" }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Gradient overlay with text & button */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center px-6 sm:px-10 md:px-14 text-left pointer-events-none">
                    <div className="max-w-xl space-y-2 sm:space-y-3 animate-fade-in pointer-events-auto">

                      {/* Badge */}
                      <span className="inline-flex items-center gap-1.5 bg-[#0d9488]/90 text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                        <Sparkles className="h-2.5 w-2.5" />
                        {linkedCourse ? linkedCourse.tag || "Destaque" : "Destaque"}
                      </span>

                      {banner.title && (
                        <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-white leading-tight drop-shadow-md">
                          {banner.title}
                        </h2>
                      )}

                      {banner.subtitle && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-200 font-sans leading-relaxed line-clamp-2">
                          {banner.subtitle}
                        </p>
                      )}

                      {/* Linked course preview chip */}
                      {linkedCourse && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
                          <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded-sm truncate max-w-[200px]">
                            {linkedCourse.title}
                          </span>
                          <span className="text-[#0d9488] font-bold">
                            {linkedCourse.price === 0 ? "Grátis" : `${linkedCourse.price.toLocaleString("pt-PT")} MT`}
                          </span>
                        </div>
                      )}

                      {/* CTA Button */}
                      <div className="pt-1 sm:pt-2">
                        <button
                          onClick={(e) => handleBannerAction(banner, e)}
                          className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] active:bg-[#0d9488] text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-wider py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>{banner.buttonText || (linkedCourse ? "Ver Curso" : "Explorar")}</span>
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/75 text-white p-1.5 sm:p-2.5 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
              id="carousel-btn-prev"
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/75 text-white p-1.5 sm:p-2.5 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
              id="carousel-btn-next"
              title="Próximo"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {activeBanners.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2"
            id="carousel-pagination-indicators"
          >
            {activeBanners.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(index, e)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? "w-6 bg-[#0d9488]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
