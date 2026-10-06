import React from "react";
import { Clock, CheckCircle2, AlertTriangle, PlayCircle, Award, BookOpen, Calendar } from "lucide-react";
import { UserProfile } from "../types";

interface HistoryViewProps {
  user: UserProfile;
}

export default function HistoryView({ user }: HistoryViewProps) {
  // Extract tracking arrays
  const quizAnswers = user.quizAnswersTrack ? Object.values(user.quizAnswersTrack) : [];
  const watchedVideos = user.watchedVideos ? Object.values(user.watchedVideos) : [];

  // Sort answers and videos chronologically if date exists, otherwise fallback to default sequence
  const sortedQuizzes = [...quizAnswers].reverse();
  const sortedVideos = [...watchedVideos].reverse();

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-10 px-4" id="history-view">
      <div className="w-full max-w-4xl mx-auto space-y-8" id="history-wrapper">
        
        {/* Title Heading Block header */}
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-left shadow-xs" id="history-header-card">
          <div className="space-y-2">
            <span className="text-[10px] bg-slate-100 text-slate-800 px-3 py-1 rounded-sm uppercase font-mono font-bold tracking-wider">
              Histórico de Estudo & Aulas
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3.5xl text-[#0a2540] tracking-tight">
              Historial de Atividades
            </h2>
            <div className="w-12 h-[3px] bg-[#0d9488]" />
            <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-xl">
              Acompanhe de forma detalhada o seu progresso cronológico. 
              Aqui constam todos os vídeos reproduzidos e as perguntas resolvidas com o respetivo status de correção.
            </p>
          </div>
        </div>

        {/* Double-column activity blocks for Videos & Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="history-grid-split">
          
          {/* Section 1: Watched Videos (Timeline) - 5 columns */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm text-left shadow-xs space-y-4" id="watched-videos-timeline">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-[#0a2540] uppercase tracking-wider">Vídeos Assistidos</h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-sm font-mono font-bold text-slate-600">
                {watchedVideos.length} aulas
              </span>
            </div>

            {sortedVideos.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-sm border border-slate-100 space-y-3" id="videos-empty">
                <PlayCircle className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-xs">Nenhum vídeo reproduzido</h4>
                <p className="text-[10px] text-slate-400">Entre nas aulas dos cursos matriculados para iniciar as video-aulas e monitorar seu progresso científico.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-6" id="videos-timeline-track">
                {sortedVideos.map((vid, idx) => (
                  <div key={idx} className="relative group text-left" id={`timeline-vid-item-${idx}`}>
                    {/* Circle Bullet icon marker */}
                    <div className="absolute -left-[21px] top-1 bg-[#0d9488] w-2.5 h-2.5 rounded-full border border-white" />
                    
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-[#0d9488] font-bold uppercase block tracking-wider leading-none">
                        {vid.courseTitle}
                      </span>
                      <h4 className="font-sans font-bold text-xs text-slate-800 leading-tight">
                        {vid.videoTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>Concluído em: {vid.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Quizzes Solved Log (With accuracy flags) - 7 columns */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm text-left shadow-xs space-y-4" id="quizzes-solved-log">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-[#0a2540] uppercase tracking-wider">Histórico de Quizzes</h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-sm font-mono font-bold text-slate-600">
                {quizAnswers.length} perguntas
              </span>
            </div>

            {sortedQuizzes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-sm border border-slate-100 space-y-3" id="quiz-empty-box">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-xs">Nenhum quiz resolvido</h4>
                <p className="text-[10px] text-slate-400">Responda aos questionários rápidos anexados em cada aula para testar seu nível de rendimento teórico.</p>
              </div>
            ) : (
              <div className="space-y-4" id="quizzes-timeline-list">
                {sortedQuizzes.map((ans, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-150 p-4 rounded-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4"
                    id={`quiz-log-item-${idx}`}
                  >
                    <div className="space-y-1.5 flex-1 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-xs leading-none">
                          {ans.courseTitle}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {ans.date}
                        </span>
                      </div>

                      <h4 className="font-sans font-bold text-xs text-slate-700 leading-snug">
                        {ans.questionText}
                      </h4>

                      <p className="text-[11px] font-medium text-slate-500 font-sans">
                        Opção selecionada: <strong className="text-slate-800 font-bold">"{ans.selectedOption}"</strong>
                      </p>
                    </div>

                    {/* Badge Indicator tag for correctness */}
                    <div className="shrink-0 self-end sm:self-auto" id={`quiz-status-badge-${idx}`}>
                      {ans.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-sm uppercase tracking-wide">
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-2" />
                          <span>Acertou</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-sm uppercase tracking-wide">
                          <AlertTriangle className="h-3.5 w-3.5 stroke-2" />
                          <span>Errou</span>
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
