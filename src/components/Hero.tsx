import React from "react";
import { Sparkles, Users } from "lucide-react";

interface HeroProps {
  onStartLearningClick: () => void;
  coursesCount: number;
}

export default function Hero({ onStartLearningClick, coursesCount }: HeroProps) {
  return (
    <section 
      className="w-full bg-slate-50 border-b border-slate-100 py-10 px-4 md:px-8 overflow-hidden" 
      id="cursaqi-hero-section"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="hero-layout-grid">
        {/* Left Column: Core Value Propositions */}
        <div className="lg:col-span-7 flex flex-col items-start text-left" id="hero-col-left">
          {/* Subtitle Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-sm mb-6" 
            id="hero-badge-container"
          >
            <Sparkles className="h-4 w-4 text-[#0d9488]" id="hero-badge-icon" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0e7490] font-mono animate-fade-in" id="hero-badge-text">
              Certificados de conclusão na nossa plataforma
            </span>
          </div>

          {/* Primary Main Heading */}
          <h1 
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0a2540] mb-6 leading-[1.1]" 
            id="hero-main-title"
          >
            O Melhor Ensino Para <br />
            <span className="text-[#0d9488]" id="hero-title-accent">Potencializar Competências</span>
          </h1>

          {/* Supportive description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-sans" id="hero-tagline-text">
            Inicie a sua jornada educativa para um futuro de excelência. Tenha acesso irrestrito a cursos lecionados por profissionais certificados do mercado de trabalho. Descubra lições práticas focadas nas exigências atuais.
          </p>

          {/* Interactive CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto" id="hero-cta-group">
            <button
              onClick={onStartLearningClick}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium px-8 py-4 rounded-sm transition-colors duration-150 text-center cursor-pointer shadow-xs font-sans tracking-wide"
              id="hero-cta-btn-primary"
            >
              Começar a Aprender Agora
            </button>
            <button
              onClick={() => {
                const docSection = document.getElementById("cta-banners-section");
                if (docSection) docSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="border border-slate-300 hover:border-[#0d9488] hover:text-[#0d9488] text-slate-700 font-medium px-6 py-4 rounded-sm transition-colors duration-150 text-center cursor-pointer font-sans"
              id="hero-cta-btn-secondary"
            >
              Saber Mais
            </button>
          </div>

          {/* Client trust statistics */}
          <div className="flex items-center gap-6 mt-10 p-3 bg-white/60 rounded-sm border border-slate-100 animate-fade-in" id="hero-trust-indicators">
            <div className="flex flex-col text-left" id="item-trust-1">
              <span className="text-2xl font-bold text-[#0a2540] font-display animate-fade-in" id="stat-1-val">{coursesCount}</span>
              <span className="text-xs text-slate-500 font-sans" id="stat-1-lbl">Cursos Disponíveis</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" id="stat-divider" />
            <div className="flex flex-col text-left" id="item-trust-2">
              <span className="text-2xl font-bold text-[#0a2540] font-display" id="stat-2-val">98%</span>
              <span className="text-xs text-slate-500 font-sans" id="stat-2-lbl">Satisfação</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Visual Graphic & Floating Stat Overlay */}
        <div className="lg:col-span-5 relative flex justify-center py-6" id="hero-col-right">
          <div className="relative w-full max-w-[380px] aspect-square md:max-w-[420px]" id="hero-image-wrap">
            {/* Main Visual Photo Frame with solid borders */}
            <div 
              className="w-full h-full bg-slate-200 border-4 border-white shadow-md rounded-md overflow-hidden relative" 
              id="hero-image-frame"
            >
              <img 
                src="https://ik.imagekit.io/mdsiwq57o/ChatGPT%20Image%2010_07_2026,%2020_25_27.png" 
                alt="Student focusing on reading resources"
                className="w-full h-full object-cover grayscale-20 animate-fade-in"
                referrerPolicy="no-referrer"
                id="hero-img-element"
              />
              {/* Slate dark cover strip for academic aesthetics */}
              <div 
                className="absolute bottom-0 left-0 w-full bg-[#0a2540]/80 p-4 text-white text-xs border-t border-white/20 text-left" 
                id="hero-image-banner"
              >
                Na busca incessante pelo rigor intelectual e elevação profissional.
              </div>
            </div>



            {/* Flat Solid Accents */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-teal-600/10 border border-teal-600/20 rounded-xs -z-10" />
            <div className="absolute bottom-8 -right-8 w-12 h-12 bg-slate-200/50 rounded-xs -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
