import React from "react";
import { 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  Bookmark, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Heart, 
  Users, 
  ArrowRight,
  FolderOpen,
  Laptop,
  Check
} from "lucide-react";
import { Course, CourseVideo, UserProfile } from "../types";

interface HomeDashboardViewProps {
  user: UserProfile;
  courses: Course[];
  videos: CourseVideo[];
  onViewCourseDetails: (course: Course) => void;
  onNavigateToView: (view: string) => void;
  onOpenStudyModal: (course: Course) => void;
  onToggleWishlist?: (courseId: string) => void;
}

export default function HomeDashboardView({
  user,
  courses,
  videos,
  onViewCourseDetails,
  onNavigateToView,
  onOpenStudyModal,
  onToggleWishlist,
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

  // Initials for avatar fallback
  const userInitials = user.fullName
    ? user.fullName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "CQ";

  return (
    <div className="w-full space-y-8 text-left font-sans" id="student-main-dashboard">
      
      {/* 1. Modern Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" id="dashboard-stats-row">
        
        {/* Metric 1: Cursos Matriculados */}
        <div 
          className="bg-white border border-slate-200/90 hover:border-teal-500/40 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm text-left flex flex-col justify-between group"
          id="metric-enrolls"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
              Cursos Ativos
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-display font-black text-[#0a2540]">
              {totalEnrolled}
            </div>
            <p className="text-[10.5px] text-slate-500 font-sans">
              {totalEnrolled === 1 ? "1 curso em andamento" : `${totalEnrolled} cursos em andamento`}
            </p>
          </div>
        </div>

        {/* Metric 2: Média de Progresso */}
        <div 
          className="bg-white border border-slate-200/90 hover:border-indigo-500/40 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm text-left flex flex-col justify-between group"
          id="metric-avg-progress"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
              Média Geral
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl sm:text-3xl font-display font-black text-[#0a2540]">
              {averageProgress}%
            </div>
            {/* Smooth Visual Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#0d9488] to-indigo-500 h-full transition-all duration-500 rounded-full" 
                style={{ width: `${averageProgress}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Respostas Acertadas */}
        <div 
          className="bg-white border border-slate-200/90 hover:border-emerald-500/40 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm text-left flex flex-col justify-between group"
          id="metric-correct-q"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
              Questões Certas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-display font-black text-emerald-700">
              {correctCount}
            </div>
            <p className="text-[10.5px] text-slate-500 font-sans">
              De {totalSolved} respondidas
            </p>
          </div>
        </div>

        {/* Metric 4: Precisão Geral nos Quizzes */}
        <div 
          className="bg-white border border-slate-200/90 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm text-left flex flex-col justify-between group"
          id="metric-incorrect-q"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
              Precisão
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-display font-black text-amber-700">
              {successRate}%
            </div>
            <p className="text-[10.5px] text-slate-500 font-sans">
              {incorrectCount === 0 ? "Nenhum erro registrado" : `${incorrectCount} para rever`}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Central Core Section: Cursos Matriculados */}
      <div className="space-y-4" id="resume-classes-card">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-display font-black text-lg text-[#0a2540] tracking-tight flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#0d9488]" />
              <span>Cursos em Andamento</span>
              <span className="text-xs font-mono font-bold bg-teal-50 text-[#0d9488] px-2.5 py-0.5 rounded-full border border-teal-200">
                {totalEnrolled}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Assista às aulas gravadas pelo Formador Aldo Valige e continue de onde parou.
            </p>
          </div>

          <button
            onClick={() => onNavigateToView("courses")}
            className="inline-flex items-center gap-1.5 text-xs text-[#0d9488] hover:text-[#0f766e] font-bold font-sans hover:underline cursor-pointer self-start sm:self-auto"
          >
            <span>Explorar Mais Cursos</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {enrolledCoursesData.length === 0 ? (
          /* Empty state for students not yet enrolled in any course */
          <div 
            className="bg-gradient-to-br from-white via-slate-50 to-teal-50/20 border border-slate-200 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xs"
            id="enrolled-empty-block"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-[#0d9488] flex items-center justify-center mx-auto shadow-xs">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-display font-bold text-slate-850 text-base">
                Nenhum curso matriculado no momento
              </h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Descubra a seleção de cursos práticos de Informática, redes e programação da CUrsaQi. Inscreva-se com 1 clique para começar a estudar agora mesmo.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToView("courses")}
                className="inline-flex items-center gap-2 bg-[#0a2540] hover:bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>Explorar Catálogo de Cursos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Enrolled Courses Vertical Cards List */
          <div className="space-y-3.5" id="enrolled-progress-list">
            {enrolledCoursesData.map(({ progress, course }) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200/90 hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 group"
                id={`progress-row-${course.id}`}
              >
                {/* Course Visual Thumbnail and Meta */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-24 sm:w-28 h-18 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-150 bg-slate-900 group-hover:scale-102 transition-transform">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-[#0d9488] uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {course.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {course.lessonsCount} aulas
                      </span>
                    </div>

                    <h4 
                      onClick={() => onViewCourseDetails(course)}
                      className="font-display font-bold text-sm sm:text-base text-[#0a2540] hover:text-[#0d9488] transition-colors truncate leading-tight cursor-pointer" 
                      title={course.title}
                    >
                      {course.title}
                    </h4>

                    {/* Progress Bar Container */}
                    <div className="space-y-1 max-w-md pt-0.5">
                      <div className="flex justify-between text-[10.5px] text-slate-500 font-mono">
                        <span>Conclusão das Aulas</span>
                        <span className="font-bold text-[#0d9488]">{progress.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="bg-gradient-to-r from-[#0d9488] to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => onViewCourseDetails(course)}
                    className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 hover:bg-[#0a2540] hover:text-white rounded-xl text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer"
                  >
                    Ver Ficha
                  </button>
                  <button
                    onClick={() => onOpenStudyModal(course)}
                    className="py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Continuar Aula</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Section: Os Meus Favoritos (Vertical List) */}
      <div className="space-y-4" id="favorites-dashboard-box">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-display font-black text-lg text-[#0a2540] tracking-tight flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
              <span>Os Meus Favoritos</span>
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-200">
                {favoriteCourses.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Cursos que você marcou com coração para estudar a seguir.
            </p>
          </div>
        </div>

        {favoriteCourses.length === 0 ? (
          /* Empty Favorites Notification */
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center text-xs text-slate-400 font-sans space-y-2 shadow-xs"
            id="favorites-empty"
          >
            <Heart className="h-8 w-8 text-slate-300 mx-auto stroke-[1.5]" />
            <p className="text-slate-600 font-semibold text-xs">Ainda não possui cursos adicionados aos favoritos.</p>
            <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
              Ao navegar pelo catálogo de cursos, clique no ícone de coração para guardar aqui as formações do seu interesse.
            </p>
          </div>
        ) : (
          /* Favorites Vertical List */
          <div className="flex flex-col space-y-3" id="favorites-vertical-list">
            {favoriteCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 hover:border-teal-500/50 p-4 sm:p-4.5 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs group"
                id={`fav-dash-item-${c.id}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-16 h-14 sm:w-20 sm:h-16 object-cover rounded-xl border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-[#0d9488] uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {c.tag || c.category}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        c.price === 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {c.price === 0 ? "Grátis" : `${c.price.toLocaleString("pt-PT")} MT`}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onViewCourseDetails(c)}
                      className="font-display font-bold text-sm text-[#0a2540] hover:text-[#0d9488] transition-colors truncate leading-tight cursor-pointer" 
                      title={c.title}
                    >
                      {c.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-sans">
                      <span>Formador: {c.instructorName}</span>
                      <span>•</span>
                      <span className="font-mono">{c.lessonsCount} aulas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onViewCourseDetails(c)}
                    className="py-2 px-3.5 bg-slate-50 border border-slate-200 hover:bg-[#0a2540] hover:text-white rounded-xl text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer"
                  >
                    Ver Ficha
                  </button>
                  <button
                    onClick={() => onOpenStudyModal(c)}
                    className="py-2 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Estudar</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  {onToggleWishlist && (
                    <button
                      onClick={() => onToggleWishlist(c.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remover dos favoritos"
                    >
                      <Heart className="h-4 w-4 fill-rose-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Educational Structure Quality Strip */}
      <div 
        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left space-y-3"
        id="cursaqi-quality-strip"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-[#0a2540]">
            <Laptop className="h-4.5 w-4.5 text-[#0d9488]" />
            <h4 className="font-display font-bold text-sm tracking-tight uppercase">
              Metodologia CUrsaQi • Ensino Prático de Informática
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Formador Aldo Valige
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs text-slate-600 font-sans">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-[11.5px]">Aulas 100% Práticas</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Lições gravadas em vídeo, focadas em hardware, redes, montagem e programação.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-[11.5px]">Quizzes de Fixação</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Perguntas de consolidação após cada módulo para testar os seus conhecimentos reais.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-[11.5px]">Suporte no FalaQI</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Atendimento e esclarecimento de dúvidas diretamente com o orientador pedagógico.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
