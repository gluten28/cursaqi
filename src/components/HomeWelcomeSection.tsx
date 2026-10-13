import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  PlayCircle, 
  CheckCircle2, 
  MessageCircle,
  Clock
} from "lucide-react";
import { Course, UserProfile } from "../types";
import RightAdsCard from "./RightAdsCard";

interface HomeWelcomeSectionProps {
  currentUser: UserProfile | null;
  courses: Course[];
  onExploreCourses: () => void;
  onCourseClick: (course: Course) => void;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  onNavigateToView?: (view: string) => void;
}

export default function HomeWelcomeSection({
  currentUser,
  courses,
  onExploreCourses,
  onCourseClick,
  onRegisterClick,
  onLoginClick,
  onNavigateToView,
}: HomeWelcomeSectionProps) {
  // Compute enrolled stats for logged-in user
  const enrolledProgress = currentUser?.enrolledCourseProgress || [];
  const totalEnrolled = enrolledProgress.length;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-5 mb-8" id="home-welcome-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Welcome Card (Card de Boas-Vindas) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-stretch">
          <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between text-left transition-all relative overflow-hidden group">
            
            {/* Background subtle gradient accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            {/* Top Area: Badge and Title */}
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-teal-800 text-[11px] font-mono uppercase font-bold tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                <span>Boas-vindas à CUrsaQi • Ensino Prático de Informática</span>
              </div>

              {currentUser ? (
                // Logged-in greeting
                <div className="space-y-2">
                  <h1 className="font-display font-black text-2xl sm:text-3.5xl text-[#0a2540] tracking-tight leading-tight">
                    Bem-vindo de volta, <span className="text-[#0d9488]">{currentUser.fullName}</span>!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
                    Esta é a sua plataforma central de estudos. Continue a assistir às suas aulas, responda aos questionários de fixação e avance para a emissão do seu certificado oficial com o Formador Aldo Valige.
                  </p>
                </div>
              ) : (
                // Guest / Visitor greeting
                <div className="space-y-2">
                  <h1 className="font-display font-black text-2xl sm:text-3.5xl text-[#0a2540] tracking-tight leading-tight">
                    Aprenda Informática e Tecnologia <span className="text-[#0d9488]">de Forma Prática</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
                    Cursos estruturados passo a passo pelo Formador Aldo Valige. Aprenda hardware, redes, sistemas e programação com aulas gravadas em vídeo, questionários práticos e suporte no FalaQI.
                  </p>
                </div>
              )}

              {/* Highlights Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Aulas em Vídeo</span>
                    <span className="block text-[9.5px] text-slate-500 font-mono">100% Práticas</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Certificado</span>
                    <span className="block text-[9.5px] text-slate-500 font-mono">Comprovação Real</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Comunidade</span>
                    <span className="block text-[9.5px] text-slate-500 font-mono">Chat ao Vivo</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[11px] font-bold text-slate-800 truncate">FalaQI</span>
                    <span className="block text-[9.5px] text-slate-500 font-mono">Suporte Direto</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="relative pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              {currentUser ? (
                // Actions for logged-in user
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <GraduationCap className="h-4 w-4 text-[#0d9488]" />
                      <span>{totalEnrolled} {totalEnrolled === 1 ? "curso matriculado" : "cursos matriculados"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={onExploreCourses}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>Ver Cursos Disponíveis</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {onNavigateToView && (
                      <button
                        onClick={() => onNavigateToView("community")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5 text-teal-600" />
                        <span>Comunidade</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                // Actions for guest/tourist
                <>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Inscrição rápida e acesso imediato aos módulos.</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={onExploreCourses}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>Explorar Cursos</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {onRegisterClick && (
                      <button
                        onClick={onRegisterClick}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        <span>Criar Conta</span>
                      </button>
                    )}

                    {onNavigateToView && (
                      <button
                        onClick={() => onNavigateToView("about")}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-2 cursor-pointer transition-colors"
                      >
                        Sobre Nós
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Fixed Advertisement Card (Card de Anúncios vertical estilo Instagram) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-stretch">
          <div className="w-full h-full lg:sticky lg:top-6">
            <RightAdsCard
              onExploreCourses={onExploreCourses}
              onCourseClick={onCourseClick}
              courses={courses}
            />
          </div>
        </div>

      </div>
    </section>
  );
}

