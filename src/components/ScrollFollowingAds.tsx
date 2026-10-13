import React, { useState, useEffect, useRef } from "react";
import RightAdsCard from "./RightAdsCard";
import { Course, PromoBanner } from "../types";

interface ScrollFollowingAdsProps {
  banners: PromoBanner[];
  courses: Course[];
  onExploreCourses: () => void;
  onCourseClick: (course: Course) => void;
}

export default function ScrollFollowingAds({
  banners,
  courses,
  onExploreCourses,
  onCourseClick,
}: ScrollFollowingAdsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updatePosition = () => {
      if (!containerRef.current || !cardRef.current) {
        ticking = false;
        return;
      }

      // Only follow on desktop/laptop screens (>= 1024px)
      if (window.innerWidth < 1024) {
        setOffsetY(0);
        ticking = false;
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const cardHeight = cardRef.current.offsetHeight;
      const containerHeight = containerRef.current.offsetHeight;

      // Available scrolling space inside the column
      const maxScroll = Math.max(0, containerHeight - cardHeight);

      // Desired top offset from the top of the viewport when scrolling
      const targetTop = 24;

      // Distance the container has scrolled past targetTop
      const scrollDistance = -containerRect.top + targetTop;

      // Clamp offset within [0, maxScroll]
      const clamped = Math.max(0, Math.min(scrollDistance, maxScroll));

      setOffsetY(clamped);
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    updatePosition();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative min-h-[500px]" id="scroll-following-ads-container">
      <div
        ref={cardRef}
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`,
          transition: "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        className="w-full will-change-transform"
      >
        <RightAdsCard
          banners={banners}
          courses={courses}
          onExploreCourses={onExploreCourses}
          onCourseClick={onCourseClick}
        />
      </div>
    </div>
  );
}

