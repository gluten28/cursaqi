import React from "react";
import BannerCarousel from "./BannerCarousel";
import RightAdsCard from "./RightAdsCard";
import { PromoBanner, Course } from "../types";

interface HomePromoSectionProps {
  banners: PromoBanner[];
  courses?: Course[];
  onActionClick?: () => void;
  onCourseClick?: (course: Course) => void;
}

export default function HomePromoSection({
  banners,
  courses = [],
  onActionClick,
  onCourseClick,
}: HomePromoSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 mb-6" id="home-promo-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Slide Card (Square image on left, text & buttons on right, compact) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-stretch">
          <BannerCarousel
            banners={banners}
            courses={courses}
            onActionClick={onActionClick}
            onCourseClick={onCourseClick}
          />
        </div>

        {/* Right Side: Vertical Advertisement Card (Instagram format) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-stretch">
          <RightAdsCard
            onExploreCourses={onActionClick}
            onCourseClick={onCourseClick}
            courses={courses}
          />
        </div>

      </div>
    </section>
  );
}

