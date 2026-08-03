import React from "react";
import { BookOpen, GraduationCap, ShieldCheck, Award } from "lucide-react";

export default function AboutView() {
  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-12 px-4" id="about-us-page">
      <div className="w-full max-w-4xl mx-auto space-y-12" id="about-us-container">

        {/* ===== FOUNDER & TUTOR PROFILE — shown FIRST ===== */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden" id="founder-profile-card">
          <div className="bg-[#0a2540] px-8 py-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#0d9488] uppercase font-bold block mb-1">Fundador &amp; Tutor Principal</span>
              <h1 className="font-display font-bold text-2xl text-white">Aldo Bonífacio Valige</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] bg-[#0d9488]/20 border border-[#0d9488]/30 text-[#0d9488] font-mono font-bold px-3 py-1 rounded-sm uppercase tracking-wider">Desenvolvedor</span>
              <span className="text-[10px] bg-slate-700 border border-slate-600 text-slate-300 font-mono font-bold px-3 py-1 rounded-sm uppercase tracking-wider">Docente</span>
            </div>
          </div>

          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-sm overflow-hidden border-4 border-[#0d9488]/20 shadow-lg">
                <img
                  src="https://ik.imagekit.io/mdsiwq57o/IMG_20260619_134220.jpg?updatedAt=1781870156054"
                  alt="Aldo Bonífacio Valige"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CURSAQi</span>
                <span className="text-xs font-bold text-[#0d9488] font-sans">Fundação &amp; Liderança</span>
              </div>
            </div>

            {/* Bio & Skills */}
            <div className="flex-1 space-y-5 text-left">
              <div className="space-y-2">
                <h2 className="font-display font-bold text-base text-[#0a2540]">Perfil Profissional</h2>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  Fundador e tutor principal do CURSAQI, com sólida formação académica em <strong>Licenciatura em Ensino de Administração de Sistemas e Redes Informáticas</strong> pelo <em>Instituto Superior Dom Bosco</em>, e formado em <strong>Estatística Sanitária</strong> pelo <em>Instituto Médio Politécnico de Saúde (IMEPS)</em>.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  Desenvolvedor de sistemas web e desktop experiente, apaixonado por partilhar conhecimento técnico de forma prática e acessível.
                </p>
              </div>

              {/* Academic Credentials */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Formação Académica</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-sm">
                    <div className="w-2 h-2 rounded-full bg-[#0d9488] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#0a2540]">Licenciatura em Ensino de Administração de Sistemas e Redes Informáticas</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Instituto Superior Dom Bosco</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-sm">
                    <div className="w-2 h-2 rounded-full bg-[#0d9488] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#0a2540]">Estatística Sanitária</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Instituto Médio Politécnico de Saúde (IMEPS)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Competências Técnicas</h3>
                <div className="flex flex-wrap gap-2">
                  {["Java", "TypeScript", "JavaScript", "HTML", "CSS", "React", "Vite", "Next.js", "Sistemas Web", "Desktop Apps"].map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#0a2540] text-[#0d9488] border border-[#0d9488]/20 rounded-xs uppercase tracking-wide"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ABOUT CURSAQI — shown after the tutor profile ===== */}
        <div className="bg-white border border-slate-200 p-8 text-left rounded-sm space-y-3" id="about-hero-card">
          <span className="text-[10px] bg-[#0d9488]/10 text-[#0d9488] px-3 py-1 rounded-sm uppercase font-mono font-bold tracking-wider">
            Qualificação Académica Unificada e Integrada
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#0a2540] tracking-tight">
            Sobre o CURSAQI
          </h2>
          <div className="w-16 h-[3px] bg-[#0d9488]" />
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-sans mt-3">
            O CURSAQI é uma plataforma institucional dedicada ao aprimoramento profissional 
            de alta qualificação e rendimento. Nosso currículo técnico é projetado com rigor 
            científico para garantir a excelência formativa.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" id="about-principles-grid">
          
          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3" id="principle-1">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm w-12 h-12 flex items-center justify-center text-slate-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0a2540]">
              Pedagogia Baseada em Projetos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Nossa abordagem fundamenta-se na aplicabilidade prática dos conceitos teóricos. Desenvolvemos competências por meio da resolução de cenários práticos que capacitam o aluno para os desafios do mercado contemporâneo.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3" id="principle-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm w-12 h-12 flex items-center justify-center text-slate-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0a2540]">
              Avaliação de Rigor Científico
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Todos os módulos pedagógicos são acompanhados de questionários de consolidação ativa. A aprovação exige rendimento mínimo de 80%, forçando o domínio efetivo de cada competência ministrada.
            </p>
          </div>

          <div className="bg-[#0a2540] text-white p-6 rounded-sm space-y-3" id="principle-3">
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-sm w-12 h-12 flex items-center justify-center text-[#0d9488]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Certificação Unificada
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Os certificados emitidos pelo CURSAQI possuem identificadores de verificação pública exclusivos no banco de dados local. Cada credencial representa a excelência profissional e teórica atingida.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3" id="principle-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm w-12 h-12 flex items-center justify-center text-slate-700">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0a2540]">
              Qualificação Contínua
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Através do plano Premium, disponibilizamos materiais didáticos adicionais e exclusivos que complementam as aulas. O suporte de tutores qualificados auxilia na eliminação de barreiras cognitivas durante os estudos.
            </p>
          </div>

        </div>

        {/* Corporate stats section */}
        <div className="bg-white border border-slate-200 rounded-sm p-8 text-left space-y-6" id="about-stats-info">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-xl text-[#0a2540]">
              Infraestrutura Educativa Unificada
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">Estatísticas de progresso acumulado na plataforma</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6" id="about-stats-panel">
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-bold text-[#0d9488]">0</div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Cursos Publicados</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-bold text-[#0d9488]">0%</div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Média de Aprovação</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-bold text-[#0d9488]">0</div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Aulas em Vídeo</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-bold text-[#0d9488]">0</div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider font-semibold">Tópicos Técnicos</div>
            </div>
          </div>
        </div>

        {/* Corporate contact information block footer */}
        <div className="border-t border-slate-200 pt-6 text-center text-[11px] text-slate-400 font-sans space-y-1" id="about-regulatory-info">
          <div>CURSAQI INOVAÇÃO E QUALIFICAÇÃO ACADÉMICA - REGULADO SOB PORTARIA ACADÉMICA</div>
          <div>Para dúvidas institucionais, entre em contato via whatsapp de suporte no seu painel de perfil.</div>
        </div>

      </div>
    </div>
  );
}
