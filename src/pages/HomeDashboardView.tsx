import React from "react";
import { PlayCircle, Clock, CheckCircle, ShieldAlert, ChevronRight, Bookmark } from "lucide-react";
import { Course, CourseVideo, UserProfile } from "../types";

interface HomeDashboardViewProps {
  user: UserProfile;
  courses: Course[];
  videos: CourseVideo[];
  onViewCourseDetails: (course: Course) => void;
  onNavigateToView: (view: string) => void;
  onOpenStudyModal: (course: Course) => void;
}

export default function HomeDashboardView({
  user,
  courses,
  videos,
  onViewCourseDetails,
  onNavigateToView,
  onOpenStudyModal,
}: HomeDashboardViewProps) {
  // 1. Resumo de cursos matriculados (Enrolled Courses)
  const enrolledProgresses = user.enrolledCourseProgress || [];
  const enrolledCoursesData = enrolledProgresses.map((prog) => {
    const course = courses.find((c) => c.id === prog.courseId);
    return {
      progress: prog,
      course: course,
    };
  }).filter((item) => item.course !== undefined) as { progress: any; course: Course }[];

  // 2. Favoritos list matching
  const favoriteCourses = courses.filter((c) => user.favorites?.includes(c.id));

  // 3. Quiz correctness calculations (Respostas acertadas e erradas)
  const trackEntries = Object.values(user.quizAnswersTrack || {});
  const totalSolved = trackEntries.length;
  const correctCount = trackEntries.filter((a) => a.isCorrect).length;
  const incorrectCount = totalSolved - correctCount;
  const successRate = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;

  // 4. Progresso do aluno metrics
  const totalEnrolled = enrolledCoursesData.length;
  const averageProgress = totalEnrolled > 0 
    ? Math.round(enrolledCoursesData.reduce((acc, curr) => acc + curr.progress.progress, 0) / totalEnrolled)
    : 0;

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-8 px-4 text-left" id="student-main-dashboard">
      <div className="w-full max-w-6xl mx-auto space-y-8" id="dashboard-layout-container">
        
        {/* Plan subscription status bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs" id="dashboard-plan-bar">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Assinatura do Estudante:</span>
            <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              user.planType === "pago"
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-slate-100 text-slate-600 border-slate-300"
            }`}>
              Plano {user.planType === "pago" ? "Premium (Acesso Ilimitado)" : "Gratuito"}
            </span>
            <span className="text-xs text-slate-500 font-sans hidden md:inline">
              {user.planType === "pago" ? "• Acesso total a todos os manuais e exames." : "• Altere para Premium para materiais adicionais."}
            </span>
          </div>

          <button
            onClick={() => onNavigateToView("profile")}
            className="text-xs text-[#0d9488] hover:text-[#0f766e] font-bold font-sans hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Gerir Assinatura</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Dynamic Metric summaries grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-stats-row">
          
          <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between" id="metric-enrolls">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-450">Cursos Matriculados</span>
              <div className="text-2xl font-bold font-mono text-[#0a2540]">{totalEnrolled}</div>
              <p className="text-[9px] text-slate-400">Total de inscrições ativas</p>
            </div>
            <Bookmark className="h-5 w-5 text-slate-400 shrink-0" />
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between" id="metric-avg-progress">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-440">Média de Progresso</span>
              <div className="text-2xl font-bold font-mono text-[#0a2540]">{averageProgress}%</div>
              {/* Micro bar */}
              <div className="w-24 h-1.5 bg-slate-100 rounded-xs overflow-hidden mt-2">
                <div className="bg-[#0b9488] bg-[#0d9488] h-full" style={{ width: `${averageProgress}%` }} />
              </div>
            </div>
            <Clock className="h-5 w-5 text-slate-400 shrink-0" />
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between" id="metric-correct-q">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-650">Respostas Acertadas</span>
              <div className="text-2xl font-bold font-mono text-emerald-800">{correctCount}</div>
              <p className="text-[9px] text-emerald-600 font-medium">De {totalSolved} respostas totais</p>
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-650 shrink-0" />
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between" id="metric-incorrect-q">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-rose-650">Respostas Erradas</span>
              <div className="text-2xl font-bold font-mono text-rose-800">{incorrectCount}</div>
              <p className="text-[9px] text-rose-600 font-medium">Precisão geral de {successRate}%</p>
            </div>
            <ShieldAlert className="h-5 w-5 text-rose-650 shrink-0" />
          </div>

        </div>

        {/* Central Core layout: Enrolled progress summary and Favorites */}
        <div className="w-full space-y-6" id="dashboard-core-content">
          
          {/* Resumo de Cursos Matriculados */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs space-y-4" id="resume-classes-card">
            <div>
              <h3 className="font-display font-extrabold text-[#0a2540] text-sm uppercase tracking-wider pb-3 border-b border-slate-100">
                Resumo de Cursos Matriculados ({totalEnrolled})
              </h3>
            </div>

            {enrolledCoursesData.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 border border-slate-100 rounded-sm space-y-4" id="enrolled-empty-block">
                <PlayCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700 text-xs">Sem cursos inscritos no momento</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Vá até ao catálogo de cursos para se inscrever em qualquer curso e acompanhar o seu progresso aqui.</p>
                </div>
                <button
                  onClick={() => onNavigateToView("courses")}
                  className="inline-flex items-center gap-1.5 bg-[#0a2540] hover:bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-5 rounded-xs mt-2 cursor-pointer transition-colors"
                >
                  <span>Ir Para Cursos</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4" id="enrolled-progress-list">
                {enrolledCoursesData.map(({ progress, course }) => (
                  <div
                    key={course.id}
                    className="border border-slate-150 p-4 rounded-sm hover:border-slate-350 transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                    id={`progress-row-${course.id}`}
                  >
                    <div className="space-y-2 flex-1 text-left min-w-0">
                      <span className="text-[9px] font-mono text-[#0d9488] font-bold uppercase tracking-wider leading-none">
                        {course.category}
                      </span>
                      <h4 className="font-display font-bold text-sm text-[#0a2540] truncate leading-tight">
                        {course.title}
                      </h4>
                      
                      {/* Progress Bar with text */}
                      <div className="space-y-1" id={`pbar-wrapper-${course.id}`}>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Conclusão das Aulas</span>
                          <span>{progress.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-205">
                          <div 
                            className="bg-[#0d9488] h-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Direct study trigger */}
                    <div className="flex items-center justify-end shrink-0" id={`prow-btn-wrap-${course.id}`}>
                      <button
                        onClick={() => onOpenStudyModal(course)}
                        className="bg-[#0a2540] hover:bg-[#0e766e] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-4.5 rounded-xs transition-colors cursor-pointer"
                      >
                        Continuar Estudos
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favoritos (Vertical stack: um por cima do outro) */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs space-y-4" id="favorites-dashboard-box">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-[#0a2540] text-sm uppercase tracking-wider">
                Os Meus Favoritos ({favoriteCourses.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Lista Vertical</span>
            </div>

            {favoriteCourses.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-sm text-xs text-slate-400 font-sans" id="favorites-empty">
                Não possui cursos adicionados aos seus favoritos. 
                Clique no ícone de coração nos cursos que quer monitorar.
              </div>
            ) : (
              <div className="flex flex-col space-y-3 animate-fade-in" id="favorites-vertical-list">
                {favoriteCourses.map((c) => (
                  <div
                    key={c.id}
                    className="border border-slate-200 bg-white hover:border-[#0d9488]/60 p-4 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs group"
                    id={`fav-dash-item-${c.id}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] font-mono font-bold text-[#0d9488] uppercase block tracking-wider leading-none">
                          {c.tag || c.category}
                        </span>
                        <h4 className="font-display font-bold text-sm text-[#0a2540] truncate leading-tight mt-1" title={c.title}>
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans mt-1">
                          <span>Formador: {c.instructorName}</span>
                          <span>•</span>
                          <span className="font-mono">{c.lessonsCount} aulas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => onViewCourseDetails(c)}
                        className="py-1.5 px-3 bg-slate-50 border border-slate-200 hover:bg-[#0a2540] hover:text-white rounded-lg text-[9.5px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                      <button
                        onClick={() => onOpenStudyModal(c)}
                        className="py-1.5 px-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg text-[9.5px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Estudar</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
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
