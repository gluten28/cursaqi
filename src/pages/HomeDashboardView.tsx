import React from "react";
import { PlayCircle, Heart, Award, Clock, CheckCircle, ShieldAlert, BarChart3, HelpCircle, ChevronRight, Bookmark } from "lucide-react";
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

  // 5. Vídeos mais assistidos (now using real data from the database)
  const featuredLectures = videos.slice(0, 3).map((vid) => {
    const course = courses.find((c) => c.id === vid.courseId);
    return {
      id: vid.id,
      title: vid.title,
      courseName: course ? course.title : "Curso Desconhecido",
      duration: vid.duration || "--:--",
      courseId: vid.courseId,
    };
  });

  const handleLectureClick = (courseId: string) => {
    const found = courses.find((c) => c.id === courseId);
    if (found) {
      onViewCourseDetails(found);
    }
  };


  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-8 px-4 text-left" id="student-main-dashboard">
      <div className="w-full max-w-6xl mx-auto space-y-8" id="dashboard-layout-container">
        
        {/* Greeting block with subscription plan description */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="dashboard-welcome">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0d9488]">CURSAQI • Painel Geral do Aluno</span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-[#0a2540] tracking-tight">
              Bem-vindo, {user.fullName}
            </h2>
            <div className="w-16 h-[2px] bg-[#0d9488] mb-3" />
            <p className="text-xs text-slate-500 font-sans leading-normal max-w-lg">
              Esta é a sua Página Inicial de acompanhamento dos seus cursos de informática. 
              Aqui pode analisar o seu progresso nas aulas, rever exercícios e acompanhar a sua aprendizagem prática.
            </p>
          </div>

          {/* Plan Type Display Box */}
          <div className="bg-slate-50 border border-slate-150 p-5 rounded-sm flex flex-col justify-between shrink-0 self-stretch md:self-auto space-y-3" id="dashboard-plan-card">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Minha Assinatura:</span>
              <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-xs border ${
                user.planType === "pago"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-slate-100 text-slate-600 border-slate-350"
              }`}>
                Plan Tipo {user.planType === "pago" ? "Premium" : "Gratuito"}
              </span>
            </div>

            <div className="text-left font-sans text-xs text-slate-600 leading-snug">
              {user.planType === "pago" ? (
                <span>Acesso Completo liberado para todos os manuais e materiais complementares pagos.</span>
              ) : (
                <span>Materiais didáticos de cursos pagos bloqueados. Altere seu plano para desbloquear.</span>
              )}
            </div>

            <button
              onClick={() => onNavigateToView("profile")}
              className="text-center w-full bg-[#0a2540] hover:bg-[#0d9488] text-white py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer font-sans"
              id="dash-manage-plan-btn"
            >
              Gerir Assinatura do Plano
            </button>
          </div>
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

        {/* Central Core layout double-columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="dashboard-core-split">
          
          {/* Left Main (8 cols): Enrolled progress summary list */}
          <div className="lg:col-span-8 space-y-6" id="dashboard-left-block">
            
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

            {/* Favoritos (Favorites grid list) */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs space-y-4" id="favorites-dashboard-box">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-[#0a2540] text-sm uppercase tracking-wider">
                  Os Meus Favoritos ({favoriteCourses.length})
                </h3>
              </div>

              {favoriteCourses.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-sm text-xs text-slate-400 font-sans" id="favorites-empty">
                  Não possui cursos adicionados aos seus favoritos. 
                  Clique no ícone de coração nos cursos que quer monitorar.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" id="favorites-small-grid">
                  {favoriteCourses.map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-150 p-3.5 rounded-sm hover:border-slate-350 transition-all flex items-center justify-between text-left gap-3 pointer-events-auto"
                      id={`fav-dash-item-${c.id}`}
                    >
                      <div className="min-w-0">
                        <span className="text-[8px] font-mono font-bold text-[#0d9488] uppercase block tracking-widest">{c.tag}</span>
                        <h4 className="font-sans font-bold text-xs text-slate-800 truncate leading-tight mt-0.5">{c.title}</h4>
                        <span className="text-[9px] text-slate-400 font-mono italic mt-1.5 block">por {c.instructorName}</span>
                      </div>

                      <button
                        onClick={() => onViewCourseDetails(c)}
                        className="py-1.5 px-3 bg-slate-50 border border-slate-205 hover:bg-[#0a2540] hover:text-white rounded-xs text-[9px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer hover:border-slate-850 shrink-0"
                      >
                        Ver Ficha
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar (4 cols): Most watched lectures, quiz performance stats indicator */}
          <div className="lg:col-span-4 space-y-6" id="dashboard-right-block">
            
            {/* VÍDEOS MAIS ASSISTIDOS (Most watched lecture panels) */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs space-y-4 font-sans text-left" id="popular-lectures-card">
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#0a2540]">
                  Vídeos Mais Assistidos
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Vídeos recentemente adicionados na plataforma</p>
              </div>

              <div className="space-y-3.5" id="popular-lectures-list">
                {featuredLectures.length > 0 ? (
                  featuredLectures.map((feat) => (
                    <div
                      key={feat.id}
                      onClick={() => handleLectureClick(feat.courseId)}
                      className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 font-sans hover:bg-slate-50 p-2 cursor-pointer transition-colors rounded-xs text-left"
                      id={`feat-lecture-${feat.id}`}
                    >
                      <span className="text-[8px] font-mono font-semibold text-slate-400 block leading-none truncate">
                        {feat.courseName}
                      </span>
                      <h4 className="font-sans font-bold text-xs text-slate-850 truncate leading-tight mt-1 hover:text-[#0d9488] transition-colors" title={feat.title}>
                        {feat.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 px-0 text-[10px] text-[#0d9488] font-mono">
                        <span>Duração: {feat.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Sem vídeos disponíveis de momento.</p>
                )}
              </div>
            </div>

            {/* Honor regulations layout */}
            <div className="bg-[#0a2540] text-slate-100 border border-slate-200 p-5 rounded-sm text-xs text-left space-y-3" id="honor-regulations-dashboard">
              <div className="flex items-center gap-2 text-[#0d9488]">
                <Award className="h-5 w-5 stroke-2 shrink-0" />
                <h4 className="font-mono font-black uppercase tracking-wider text-[10px]">Cursos CURSAQI // Formador Aldo Valige</h4>
              </div>
              <p className="font-sans leading-relaxed text-[10.5px] text-slate-300">
                Lembre-se: os questionários rápidos de consolidação podem ser respondidos múltiplas vezes até atingir rendimento sólido de aprovação. Use o Histórico para focar nos seus erros.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
