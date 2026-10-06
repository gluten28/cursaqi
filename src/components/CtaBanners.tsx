import React from "react";
import { GraduationCap, Users2, ArrowRight } from "lucide-react";

interface CtaBannersProps {
  onLearnMoreLeft: () => void;
  onLearnMoreRight: () => void;
}

export default function CtaBanners({ onLearnMoreLeft, onLearnMoreRight }: CtaBannersProps) {
  return (
    <section className="w-full py-10 bg-slate-50 border-b border-slate-100 px-4 md:px-8" id="cta-banners-section">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8" id="cta-banners-grid-root">
        
        {/* Left Card: Expert Teacher */}
        <div 
          className="bg-white border border-slate-100 p-8 md:p-10 rounded-sm flex flex-col md:flex-row gap-8 items-center justify-between"
          id="cta-expert-teacher-card"
        >
          <div className="flex-1 text-left" id="expert-card-text">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0d9488] font-bold" id="expert-tag">
              Aprenda em Conjunto com
            </span>
            <h3 className="font-display text-2xl font-bold text-[#0a2540] mt-2 mb-3" id="expert-title">
              Formadores Especializados
            </h3>
            <p className="text-slate-500 text-sm font-sans mb-6 leading-relaxed" id="expert-desc">
              Se procura desenvolver uma competência específica, ligue-se ao nosso corpo de formadores altamente qualificados e com vasta experiência de mercado.
            </p>
            <button
              onClick={onLearnMoreLeft}
              className="inline-flex items-center gap-2 bg-[#0a2540] hover:bg-[#0f766e] text-white text-xs font-semibold tracking-wider uppercase py-3 px-6 rounded-sm cursor-pointer transition-colors font-sans"
              id="expert-btn"
            >
              <span>Ver Todos os Cursos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="w-full max-w-[140px] aspect-square flex items-center justify-center bg-teal-50/50 border border-teal-100 rounded-sm p-4 text-[#0d9488]" id="expert-ill-wrapper">
            <GraduationCap className="w-16 h-16 stroke-[1.25]" id="expert-illustration" />
          </div>
        </div>

        {/* Right Card: For Individuals */}
        <div 
          className="bg-white border border-slate-100 p-8 md:p-10 rounded-sm flex flex-col md:flex-row gap-8 items-center justify-between"
          id="cta-individuals-card"
        >
          <div className="flex-1 text-left" id="individuals-card-text">
            <span className="text-xs uppercase font-mono tracking-wider text-[#0e7490] font-bold" id="individuals-tag">
              Adquira competências cruciais
            </span>
            <h3 className="font-display text-2xl font-bold text-[#0a2540] mt-2 mb-3" id="individuals-title">
              Para Profissionais
            </h3>
            <p className="text-slate-500 text-sm font-sans mb-6 leading-relaxed" id="individuals-desc">
              Se deseja acelerar a sua carreira ou dominar uma nova especialidade, selecione os nossos programas focados no crescimento prático.
            </p>
            <button
              onClick={onLearnMoreRight}
              className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0a2540] text-white text-xs font-semibold tracking-wider uppercase py-3 px-6 rounded-sm cursor-pointer transition-colors font-sans"
              id="individuals-btn"
            >
              <span>Encontrar o Seu Curso</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="w-full max-w-[140px] aspect-square flex items-center justify-center bg-slate-50 border border-slate-100 rounded-sm p-4 text-slate-700" id="individuals-ill-wrapper">
            <Users2 className="w-16 h-16 stroke-[1.25]" id="individuals-illustration" />
          </div>
        </div>

      </div>
    </section>
  );
}
