import React, { useEffect } from "react";
import { Lock, UserPlus, LogIn, CheckCircle2, ShieldAlert, X, Sparkles, Award } from "lucide-react";
import { Course } from "../types";

interface AuthWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export default function AuthWallModal({
  isOpen,
  onClose,
  course,
  onGoToRegister,
  onGoToLogin,
}: AuthWallModalProps) {
  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-left"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-wall-title"
    >
      <div 
        className="bg-white w-full max-w-lg rounded-sm shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Lock icon */}
        <div className="bg-[#0a2540] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0d9488]/20 border border-[#0d9488]/40 flex items-center justify-center text-[#0d9488] shrink-0">
              <Lock className="h-6 w-6 stroke-2" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#0d9488] block">
                Área Exclusiva para Estudantes
              </span>
              <h3 id="auth-wall-title" className="font-display font-bold text-lg md:text-xl text-white mt-0.5">
                Registo Obrigatório para Ver Conteúdos
              </h3>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Course preview if specified */}
          {course && (
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xs">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-16 h-16 rounded-xs object-cover border border-slate-200 shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400">
                  {course.category} • {course.lessonsCount} Aulas
                </span>
                <h4 className="font-display font-bold text-xs text-[#0a2540] truncate mt-0.5">
                  {course.title}
                </h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Formador: <strong className="text-slate-700">{course.instructorName}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Para aceder às <strong>videoaulas dedicadas</strong>, descarregar os <strong>materiais didáticos</strong> e emitir o seu <strong>certificado de conclusão</strong>, é obrigatório criar uma conta na plataforma.
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 bg-slate-50/70 p-4 rounded-xs border border-slate-150">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">
              O que ganha ao criar a sua conta gratuita:
            </span>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0d9488] shrink-0" />
                <span>Acesso ilimitado às aulas e conteúdos do catálogo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0d9488] shrink-0" />
                <span>Acesso a materiais de estudo e código-fonte em PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0d9488] shrink-0" />
                <span>Realização de quizzes práticos e exame de avaliação</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#0d9488] shrink-0" />
                <span>Direito a certificado oficial digital e entrega física</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={onGoToRegister}
              className="w-full py-3.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
              id="auth-wall-register-btn"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>Criar Conta Gratuita em 1 Minuto</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="w-full py-2.5 px-4 border border-slate-300 hover:border-[#0a2540] text-[#0a2540] hover:text-black text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
              id="auth-wall-login-btn"
            >
              <LogIn className="h-4 w-4" />
              <span>Já tenho conta / Iniciar Sessão</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer underline"
            >
              Continuar a explorar o catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
