import React from "react";
import { Course, UserProfile } from "../types";

interface HomeWelcomeCardProps {
  currentUser: UserProfile | null;
  courses: Course[];
  onExploreCourses: () => void;
  onCourseClick: (course: Course) => void;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  onNavigateToView?: (view: string) => void;
}

export default function HomeWelcomeCard({
  currentUser,
  courses,
  onExploreCourses,
  onCourseClick,
  onRegisterClick,
  onLoginClick,
  onNavigateToView,
}: HomeWelcomeCardProps) {
  // Compute enrolled stats for logged-in user
  const enrolledProgress = currentUser?.enrolledCourseProgress || [];
  const totalEnrolled = enrolledProgress.length;

  return (
    <div 
      className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between text-left transition-all relative overflow-hidden group"
      id="home-welcome-single-card"
    >
      {/* Background subtle gradient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-50/80 via-emerald-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      
      {/* Top Area: Title and Description */}
      <div className="relative space-y-5">
        {currentUser ? (
          // Logged-in greeting
          <div className="space-y-2">
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-[#0d9488] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
              Painel do Aluno
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0a2540] tracking-tight leading-tight">
              Bem-vindo de volta, <span className="text-[#0d9488]">{currentUser.fullName}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
              Esta é a sua plataforma central de estudos. Continue a assistir às suas aulas, responda aos questionários de fixação e avance para a emissão do seu certificado de participação na plataforma com o Formador Aldo Valige (não aplicável para concursos de emprego).
            </p>
          </div>
        ) : (
          // Guest / Visitor landing hero presentation
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="text-[10.5px] font-mono font-extrabold uppercase tracking-widest text-[#0d9488] bg-teal-50 px-3 py-1 rounded-md border border-teal-200/70">
                Plataforma de Ensino Prático de Informática
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#0a2540] tracking-tight leading-tight">
              Aprenda Informática e Tecnologia <span className="text-[#0d9488]">de Forma Prática</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
              Cursos estruturados passo a passo pelo Formador Aldo Valige. Domine hardware, redes de computadores, sistemas e programação com aulas gravadas em vídeo, questionários práticos e emissão de certificado de participação na plataforma.
            </p>
          </div>
        )}

        {/* 4 Feature Pillars (Typography-Driven, Without Emojis or Icons) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl text-left">
            <span className="block text-[10px] font-mono font-extrabold text-[#0d9488] tracking-widest">
              01
            </span>
            <span className="block text-xs font-bold text-slate-900 mt-1 truncate">
              Aulas em Vídeo
            </span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
              100% Práticas
            </span>
          </div>

          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl text-left">
            <span className="block text-[10px] font-mono font-extrabold text-amber-600 tracking-widest">
              02
            </span>
            <span className="block text-xs font-bold text-slate-900 mt-1 truncate">
              Certificação
            </span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
              Participação na Plataforma
            </span>
          </div>

          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl text-left">
            <span className="block text-[10px] font-mono font-extrabold text-indigo-600 tracking-widest">
              03
            </span>
            <span className="block text-xs font-bold text-slate-900 mt-1 truncate">
              Comunidade QI
            </span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
              Troca de Ideias ao Vivo
            </span>
          </div>

          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl text-left">
            <span className="block text-[10px] font-mono font-extrabold text-emerald-600 tracking-widest">
              04
            </span>
            <span className="block text-xs font-bold text-slate-900 mt-1 truncate">
              Suporte FalaQI
            </span>
            <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
              Apoio Pedagógico Direto
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Row (No Icons, Pure Elegant Typography) */}
      <div className="relative pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {currentUser ? (
          // Actions for logged-in user
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                {totalEnrolled} {totalEnrolled === 1 ? "curso matriculado" : "cursos matriculados"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onExploreCourses}
                className="px-4 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Ver Cursos Disponíveis
              </button>
              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView("community")}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Comunidade
                </button>
              )}
            </div>
          </>
        ) : (
          // Actions for visitor / landing page
          <>
            <div className="text-xs text-slate-500 font-sans">
              <span className="font-semibold text-slate-700">Inscrição Imediata:</span> Acesso contínuo aos módulos gravados e materiais de apoio.
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onExploreCourses}
                className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Explorar Cursos
              </button>

              {onRegisterClick && (
                <button
                  onClick={onRegisterClick}
                  className="px-4 py-2.5 bg-[#0a2540] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Criar Conta
                </button>
              )}

              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView("about")}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
                >
                  Sobre Nós
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
