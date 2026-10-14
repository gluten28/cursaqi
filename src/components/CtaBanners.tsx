import React from "react";

interface CtaBannersProps {
  onLearnMoreLeft: () => void;
  onLearnMoreRight: () => void;
}

export default function CtaBanners({ onLearnMoreLeft, onLearnMoreRight }: CtaBannersProps) {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-5" id="cta-banners-section">
      
      {/* Left Card: Formadores Especializados */}
      <div 
        className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-2xl flex flex-col justify-between text-left shadow-2xs group hover:border-slate-300 transition-all"
        id="cta-expert-teacher-card"
      >
        <div className="space-y-3" id="expert-card-text">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#0d9488] font-bold" id="expert-tag">
              Metodologia Aplicada
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">
              01
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0a2540] tracking-tight" id="expert-title">
            Ensino Prático com o Formador Aldo Valige
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm font-sans leading-relaxed" id="expert-desc">
            Aulas focadas na prática do mercado: montagem e manutenção de computadores, resolução de avarias, redes estruturadas e desenvolvimento com orientação direta.
          </p>

          <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="block text-2xl font-display font-black text-[#0d9488]">100%</span>
              <span className="block text-[10px] font-mono uppercase font-bold text-slate-600">Prático e Objetivo</span>
            </div>
            <div className="text-right text-[11px] font-sans text-slate-500 max-w-[180px]">
              Exercícios reais e questionários de consolidação.
            </div>
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-100">
          <button
            onClick={onLearnMoreLeft}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0a2540] hover:bg-[#0d9488] text-white text-xs font-bold tracking-wider uppercase rounded-xl cursor-pointer transition-colors font-sans"
            id="expert-btn"
          >
            Ver Todos os Cursos
          </button>
        </div>
      </div>

      {/* Right Card: Qualificação para Profissionais */}
      <div 
        className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-2xl flex flex-col justify-between text-left shadow-2xs group hover:border-slate-300 transition-all"
        id="cta-individuals-card"
      >
        <div className="space-y-3" id="individuals-card-text">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#0e7490] font-bold" id="individuals-tag">
              Evolução Profissional
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400">
              02
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0a2540] tracking-tight" id="individuals-title">
            Para Estudantes e Técnicos em Informática
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm font-sans leading-relaxed" id="individuals-desc">
            Acelere a sua evolução técnica e domine novas ferramentas de informática. Estude onde e quando desejar com acompanhamento contínuo e emissão de certificado de participação.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="block text-2xl font-display font-black text-[#0a2540]">24/7</span>
              <span className="block text-[10px] font-mono uppercase font-bold text-slate-600">Acesso Contínuo</span>
            </div>
            <div className="text-right text-[11px] font-sans text-slate-500 max-w-[180px]">
              Assista no seu computador ou telemóvel ao seu próprio ritmo.
            </div>
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-100">
          <button
            onClick={onLearnMoreRight}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold tracking-wider uppercase rounded-xl cursor-pointer transition-colors font-sans shadow-sm"
            id="individuals-btn"
          >
            Encontrar o Seu Curso
          </button>
        </div>
      </div>

    </section>
  );
}
