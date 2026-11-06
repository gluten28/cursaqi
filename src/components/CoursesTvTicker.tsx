import React from "react";
import { Course } from "../types";

interface CoursesTvTickerProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

export default function CoursesTvTicker({ courses, onCourseClick }: CoursesTvTickerProps) {
  if (!courses || courses.length === 0) return null;

  // Repeat courses so the ticker is continuous and never has empty gaps
  const repeatedCourses = courses.length < 5 
    ? [...courses, ...courses, ...courses, ...courses, ...courses, ...courses]
    : [...courses, ...courses, ...courses];

  return (
    <div 
      className="w-full bg-[#0a2540] text-white border-y border-teal-500/30 overflow-hidden shadow-inner select-none"
      id="courses-tv-ticker-bar"
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        
        {/* Left TV Broadcast Badge (Rodapé de TV / Radar CUrsaQi) */}
        <div className="flex items-center gap-2.5 px-4 md:px-5 py-2.5 bg-[#071a2e] border-r border-teal-500/20 shrink-0 z-10 shadow-md">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 leading-none">
              RADAR DE CURSOS
            </span>
            <span className="text-[8.5px] font-sans text-slate-300 uppercase tracking-wider mt-0.5">
              Formação Prática
            </span>
          </div>
        </div>

        {/* Continuous Infinite Sliding Track */}
        <div className="flex-1 overflow-hidden relative flex items-center py-1.5">
          {/* Subtle fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a2540] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a2540] to-transparent z-10" />

          <div className="animate-ticker-tape items-center gap-4 py-1">
            {repeatedCourses.map((course, index) => {
              const isFree = course.price === 0;

              return (
                <div
                  key={`${course.id}-${index}`}
                  onClick={() => onCourseClick(course)}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-teal-400/60 rounded-xl px-3.5 py-1.5 cursor-pointer transition-all shrink-0 group text-left shadow-xs"
                  title={`Clique para ver o curso: ${course.title}`}
                >
                  {/* Thumbnail */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-10 h-7 rounded-md object-cover border border-white/20 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />

                  {/* Course Details */}
                  <div className="flex flex-col max-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-mono uppercase font-bold text-teal-300 bg-teal-950/70 px-1.5 py-0.2 rounded-xs">
                        {course.tag || course.category}
                      </span>
                      {isFree ? (
                        <span className="text-[8.5px] font-mono font-bold text-emerald-300">
                          Grátis
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-mono font-bold text-amber-300">
                          {course.price.toLocaleString("pt-PT")} MT
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white truncate group-hover:text-teal-300 transition-colors mt-0.5">
                      {course.title}
                    </span>
                  </div>

                  {/* Action arrow */}
                  <span className="text-[10px] font-mono text-teal-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
