import React, { useState } from "react";
import { X, BookOpen, Star, ShieldCheck, BookmarkCheck, Lock, Play, Film, Award, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { Course, UserProfile, CourseVideo, Quiz, PaymentTicket } from "../types";
import { getFinalExamQuestions, shuffleExamQuestions } from "../utils/examUtils";
import { dbSaveExamAttempt } from "../supabase";
import VideoPlayer from "../components/VideoPlayer";

interface CourseModalProps {
  course: Course;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (courseId: string) => void;
  currentUser: UserProfile | null;
  onTriggerAuth: () => void;
  onEnrollCourse: (courseId: string) => void;
  quizzes: Quiz[];
  courseVideos: CourseVideo[];
  onSaveQuizResult: (courseId: string, quizId: string, isCorrect: boolean) => void;
  onSaveExamResult: (courseId: string, score: number, date: string, certificateId: string) => void;
  onViewCertificate: (course: Course, score: number, date: string, certificateId: string) => void;
  onWatchVideo?: (courseId: string, videoId: string) => void;
  initialVideoId?: string | null;
  paymentTickets?: PaymentTicket[];
}

export default function CourseModal({
  course,
  onClose,
  isWishlisted,
  onToggleWishlist,
  currentUser,
  onTriggerAuth,
  onEnrollCourse,
  quizzes,
  courseVideos,
  onSaveQuizResult,
  onSaveExamResult,
  onViewCertificate,
  onWatchVideo,
  initialVideoId,
  paymentTickets = [],
}: CourseModalProps) {
  // Check if current user is enrolled in this course
  // Check both: enrolledCourseProgress (direct enrollment) OR approved payment ticket
  const enrollmentProgress = currentUser?.enrolledCourseProgress?.find(
    (prog) => prog.courseId === course.id
  );
  const hasApprovedTicket = paymentTickets.some(
    (t) => t.courseId === course.id && t.userId === currentUser?.id && t.status === "APPROVED"
  );
  const isEnrolled = !!enrollmentProgress || hasApprovedTicket || currentUser?.planType === "pago";

  // Filter associated assets
  const associatedVideos = courseVideos.filter((v) => v.courseId === course.id);
  const associatedQuizzes = quizzes.filter((q) => q.courseId === course.id && q.type !== "exam");
  const examQuestionsAvailable = quizzes.filter((q) => q.courseId === course.id && q.type === "exam");

  // Active Lesson playing video state
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(() => {
    if (initialVideoId) {
      const found = associatedVideos.find((v) => v.id === initialVideoId);
      if (found) return found;
    }
    return associatedVideos[0] || null;
  });

  // Watch video tracker hook
  React.useEffect(() => {
    if (activeVideo && onWatchVideo && isEnrolled) {
      onWatchVideo(course.id, activeVideo.id);
    }
  }, [activeVideo?.id, isEnrolled]);

  React.useEffect(() => {
    if (initialVideoId) {
      const found = associatedVideos.find((v) => v.id === initialVideoId);
      if (found) {
        setActiveVideo(found);
      }
    }
  }, [initialVideoId, course.id]);

  // Quiz interactive states
  const [selectedAnswers, setSelectedAnswers] = useState<{ [quizId: string]: number }>({});
  const [evaluatedQuizzes, setEvaluatedQuizzes] = useState<{ [quizId: string]: { evaluated: boolean; correct: boolean } }>({});

  // Final Exam simulation states
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeExamQuestions, setActiveExamQuestions] = useState<Quiz[]>([]);
  const [examAnswers, setExamAnswers] = useState<{ [qIndex: number]: number }>({});
  const [examFeedbackError, setExamFeedbackError] = useState("");

  const handleStartExam = () => {
    const rawQuestions = getFinalExamQuestions(course.id, quizzes);
    if (rawQuestions.length === 0) return;
    const shuffled = shuffleExamQuestions(rawQuestions);
    setActiveExamQuestions(shuffled);
    setExamAnswers({});
    setExamFeedbackError("");
    setIsExamActive(true);
  };

  const handleOptionSelect = (quizId: string, optionIndex: number) => {
    if (evaluatedQuizzes[quizId]?.evaluated) return; // already locked
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionIndex }));
  };

  const handleEvaluateAnswer = (q: Quiz) => {
    const selected = selectedAnswers[q.id];
    if (selected === undefined) return;

    const isCorrect = selected === q.correctIndex;
    
    // Save locally
    setEvaluatedQuizzes((prev) => ({
      ...prev,
      [q.id]: { evaluated: true, correct: isCorrect },
    }));

    // Trigger parent database progress sync
    onSaveQuizResult(course.id, q.id, isCorrect);
  };

  const handleSubmitFinalExam = () => {
    const questionsToEvaluate = activeExamQuestions.length > 0
      ? activeExamQuestions
      : getFinalExamQuestions(course.id, quizzes);

    if (questionsToEvaluate.length === 0) return;

    // Check if they answered all questions
    if (Object.keys(examAnswers).length < questionsToEvaluate.length) {
      setExamFeedbackError(`Por favor, responda a todas as ${questionsToEvaluate.length} perguntas antes de submeter o exame.`);
      return;
    }

    setExamFeedbackError("");

    // Calculate score
    let correctCount = 0;
    questionsToEvaluate.forEach((q, idx) => {
      if (examAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const finalPercentage = Math.round((correctCount / questionsToEvaluate.length) * 100);
    const passed = finalPercentage >= 80;

    // Format current date: DD/MM/YYYY
    const currentDate = new Date().toLocaleDateString("pt-PT");
    
    // Generate unique Certificate validation ID
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const uniqueHash = `UP-CRT-${randomHex}-${course.id.toUpperCase()}`;

    // Callback to save to the parent state (users state local storage)
    onSaveExamResult(course.id, finalPercentage, currentDate, uniqueHash);

    // Persist exam attempt to Supabase
    if (currentUser) {
      dbSaveExamAttempt({
        id: crypto.randomUUID(),
        userId: currentUser.id,
        courseId: course.id,
        score: finalPercentage,
        passed,
        certificateId: passed ? uniqueHash : undefined,
        attemptedAt: new Date().toISOString()
      }).catch((err) => console.warn("Failed to persist exam attempt to DB:", err));
    }

    // Stop active exam answering screen to return to view result screen
    setIsExamActive(false);
  };

  return (
    <div 
      className="w-full min-h-screen bg-slate-50 font-sans pb-12 animate-fade-in text-left text-slate-800"
      id="course-detail-page"
    >
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-8" style={{ padding: "32px 16px" }}>
        {/* Navigation Breadcrumb Back to home button */}
        <div className="mb-6">
          <button 
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a2540] hover:text-[#0d9488] transition-colors bg-white border border-slate-200 py-2.5 px-5 rounded-sm shadow-2xs cursor-pointer animate-fade-in"
            id="back-to-courses-btn"
          >
            ← Voltar para o Painel / Início
          </button>
        </div>

        {/* Course content container */}
        <div 
          className="bg-white border border-slate-200 w-full rounded-sm shadow-sm flex flex-col overflow-hidden text-left"
          id="course-modal-box"
        >
        {/* Header toolbar with tight padding */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100" id="modal-header-toolbar">
          <div className="flex items-center gap-2" id="modal-sub-tag">
            <span className="text-[10px] font-mono font-bold tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-sm uppercase">
              {course.tag}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ID: {course.id}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title="Fechar"
            id="modal-close-top-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable contents box */}
        <div className="overflow-y-auto" style={{ padding: "32px block" }} id="modal-scrollable-body">
          <div className="px-6 py-4 md:px-8 space-y-6">
            {/* Main Title Banner info */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0a2540] tracking-tight">
                {course.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span>Por <strong className="text-slate-800 font-semibold">{course.instructorName}</strong> ({course.instructorTitle})</span>
                <span className="text-slate-200">|</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Star className="h-3.5 w-3.5 fill-slate-300 stroke-slate-400 text-amber-500" />
                  <strong>{course.rating.toFixed(1)}</strong>
                </span>
                <span className="text-slate-200">|</span>
                <span className="font-mono bg-slate-50 px-2 py-0.5 border border-slate-100 text-slate-600 font-bold uppercase text-[9px] rounded-xs">
                  {course.price === 0 ? "Acesso Gratuito" : `Valor: ${course.price.toLocaleString("pt-PT")} MT`}
                </span>
              </div>
            </div>

            {/* Conditional layout check: IF enrolled, render a custom workspace. Else, render course features overview. */}
            {isEnrolled ? (
              <div className="space-y-6" id="enrolled-workspace">
                {/* Enrollment Welcome bar */}
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                  <div>
                    <h4 className="font-display font-semibold text-sm text-[#0a2540]">
                      Está matriculado neste curso!
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assista às aulas gravadas em vídeo nas secções abaixo, progrida ao seu ritmo e resolva as perguntas para registar aproveitamento.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-sm shrink-0 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Progresso Atual:</span>
                    <span className="font-mono font-bold text-[#0d9488] text-sm">{enrollmentProgress?.progress || 0}%</span>
                  </div>
                </div>

                {/* Grid content split: Video Player and Class list */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="active-study-split">
                  
                  {/* Left block: Player Frame */}
                  {associatedVideos.length > 0 ? (
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block animate-fade-in">
                        Reprodutor da Aula em Vídeo
                      </span>

                      {/* Video element wrapper */}
                        <div className="aspect-video w-full bg-slate-900 border border-slate-800 rounded-sm overflow-hidden relative shadow-inner">

                          {activeVideo ? (

                            <VideoPlayer
                              videoUrl={activeVideo.videoUrl}
                              title={activeVideo.title}
                            />

                          ) : (

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-slate-400">
                              <Film className="h-8 w-8 text-slate-600 mb-2" />
                              <span className="text-xs">
                                Nenhum vídeo em reprodução.
                              </span>
                            </div>

                          )}

                        </div>

                      {/* Video info title */}
                      {activeVideo && (
                        <div className="border-b border-slate-100 pb-3">
                          <h4 className="font-display font-bold text-sm text-[#0a2540]">{activeVideo.title}</h4>
                          <span className="text-[10px] font-mono text-slate-400 block mt-1">Duração estimada: {activeVideo.duration} minutos</span>
                        </div>
                      )}

                      <div className="text-xs text-slate-500 font-sans leading-relaxed">
                        Este reprodutor simula as lições instrucionais arquivadas para este curso de <strong>{course.title}</strong>. Sinta-se à vontade para rever a matéria quantas vezes desejar.
                      </div>
                    </div>
                  ) : (
                    <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-sm flex flex-col items-center justify-center" style={{ padding: "32px" }}>
                      <Film className="h-10 w-10 text-slate-350 mb-2" />
                      <h4 className="font-bold text-slate-700 text-sm">Nenhum vídeo publicado</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto text-center mt-1">
                        Este curso não possui lições em vídeo gravadas no momento. A docência irá publicar novos conteúdos brevemente.
                      </p>
                    </div>
                  )}

                  {/* Right block: Lessons list */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block text-left">
                      Índice das Aulas ({associatedVideos.length})
                    </span>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm overflow-hidden bg-white max-h-[310px] overflow-y-auto">
                      {associatedVideos.map((video) => {
                        const isPlayingThis = activeVideo?.id === video.id;
                        return (
                          <button
                            key={video.id}
                            onClick={() => setActiveVideo(video)}
                            className={`w-full p-3 flex items-start gap-2.5 text-left transition-colors cursor-pointer ${
                              isPlayingThis ? "bg-teal-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <Play className={`h-4 w-4 shrink-0 mt-0.5 ${isPlayingThis ? "text-[#0d9488]" : "text-slate-400"}`} />
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs block font-bold truncate ${isPlayingThis ? "text-[#0d9488]" : "text-slate-700"}`}>
                                {video.title}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block mt-0.5">Duração: {video.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                      {associatedVideos.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-xs">Aulas indisponíveis.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Quizzes Section */}
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#0e7490] block text-left">
                    Questionários de Consolidação ({associatedQuizzes.length})
                  </span>

                  {associatedQuizzes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-sm border border-slate-100">
                      <Award className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-xs text-slate-400 block">Nenhum questionário listado para este plano de estudos.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="quizzes-grid">
                      {associatedQuizzes.map((quiz, qIdx) => {
                        const selectedOption = selectedAnswers[quiz.id];
                        const status = evaluatedQuizzes[quiz.id];
                        const isCompletedInDb = enrollmentProgress?.completedQuizzes?.includes(quiz.id);

                        return (
                          <div 
                            key={quiz.id}
                            className="bg-white border border-slate-200 p-5 rounded-sm space-y-4 flex flex-col justify-between"
                            id={`quiz-card-${quiz.id}`}
                          >
                            <div className="space-y-3 text-left">
                              {/* Quiz title header */}
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-sm">
                                  Pergunta {qIdx + 1}
                                </span>
                                {(status?.evaluated || isCompletedInDb) && (
                                  <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 flex items-center gap-1 select-none font-bold">
                                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5px] text-emerald-600" />
                                    Submetido
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-semibold text-[#0a2540] text-left leading-relaxed">
                                {quiz.question}
                              </p>

                              {/* Options list */}
                              <div className="space-y-1.5 pt-1">
                                {quiz.options.map((opt, oIdx) => {
                                  const isSelected = selectedOption === oIdx;
                                  const isCorrectOpt = oIdx === quiz.correctIndex;
                                  const hasFinished = status?.evaluated || isCompletedInDb;

                                  // Classes string
                                  let btnClasses = "w-full text-left p-2.5 text-xs rounded-sm border transition-colors flex items-start gap-2 cursor-pointer ";
                                  if (hasFinished) {
                                    if (isCorrectOpt) {
                                      btnClasses += "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium";
                                    } else if (isSelected) {
                                      btnClasses += "bg-rose-50 border-rose-300 text-rose-800";
                                    } else {
                                      btnClasses += "bg-slate-50 border-slate-100 text-slate-450 cursor-not-allowed";
                                    }
                                  } else {
                                    if (isSelected) {
                                      btnClasses += "bg-[#0d9488]/10 border-[#0d9488] text-[#0d9488] font-semibold";
                                    } else {
                                      btnClasses += "border-slate-200 hover:bg-slate-50 text-slate-600";
                                    }
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      disabled={hasFinished}
                                      onClick={() => handleOptionSelect(quiz.id, oIdx)}
                                      className={btnClasses}
                                    >
                                      <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-500 rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="leading-snug">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Submit action */}
                            {!isCompletedInDb && !status?.evaluated && (
                              <button
                                type="button"
                                disabled={selectedOption === undefined}
                                onClick={() => handleEvaluateAnswer(quiz)}
                                className={`w-full py-2 px-3 text-center text-xs font-bold uppercase tracking-wider rounded-sm transition-colors text-white cursor-pointer ${
                                  selectedOption === undefined
                                    ? "bg-slate-200 text-slate-450 cursor-not-allowed"
                                    : "bg-[#0a2540] hover:bg-[#0d9488]"
                                }`}
                              >
                                Responder à Pergunta
                              </button>
                            )}

                            {status?.evaluated && (
                              <div className="text-left font-sans text-[10px] leading-tight select-none pt-2">
                                {status.correct ? (
                                  <span className="text-emerald-700 font-bold block bg-emerald-50/50 p-2 border border-emerald-100 rounded-sm">
                                    Correto! Parabéns, resposta certa gravada no seu progresso.
                                  </span>
                                ) : (
                                  <span className="text-rose-705 font-medium block bg-rose-50/50 p-2 border border-rose-100 rounded-sm">
                                    Incorreto. A resposta certa era: <strong className="font-bold">{quiz.options[quiz.correctIndex]}</strong>. Estude mais e continue a treinar!
                                  </span>
                                )}
                              </div>
                            )}

                            {isCompletedInDb && !status?.evaluated && (
                              <div className="text-left bg-emerald-50/50 p-2 border border-emerald-100 rounded-xs select-none">
                                <span className="text-[10px] text-emerald-800 font-bold font-mono">✓ APROVEITAMENTO REGISTADO NESTE QUESTIONÁRIO</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Exame Final & Certificado Section */}
                <div className="border-t border-slate-200 pt-6 space-y-4" id="final-exam-section">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#0a2540]" />
                    <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider">
                      Exame Final & Certificado de Conclusão
                    </h3>
                  </div>

                  {enrollmentProgress?.examScore !== undefined ? (
                    /* User has already taken the exam */
                    enrollmentProgress.examScore >= 80 ? (
                      /* Passed */
                      <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-sm text-left space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-sm font-bold">
                            ✓ Aprovado com Sucesso
                          </span>
                          <h4 className="font-display font-bold text-[#0a2540] text-sm mt-2">
                            Parabéns! Obteve {enrollmentProgress.examScore}% de aproveitamento no Exame Final.
                          </h4>
                          <p className="text-xs text-slate-650 leading-relaxed max-w-2xl font-sans">
                            A conclusão do seu curso foi validada com êxito! O seu certificado digital de conclusão está disponível para visualização e impressão imediata.
                          </p>
                        </div>

                        <div className="bg-white p-4 border border-emerald-200 rounded-sm text-xs text-slate-600 space-y-1.5 max-w-xl">
                          <span className="block font-bold text-slate-750 text-[10px] uppercase tracking-wider">Entrega do Certificado Físico:</span>
                          <span className="block">O seu <strong>certificado físico de conclusão</strong> será assinado pelo Formador Aldo Valige e enviado para:</span>
                          <span className="block bg-slate-50 p-2 border.5 border-slate-100 rounded-xs font-mono text-[10.5px]">
                            {currentUser?.address || "Endereço não cadastrado. Por favor, atualize o seu perfil."}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (enrollmentProgress.examScore !== undefined && enrollmentProgress.examDate && enrollmentProgress.certificateId) {
                                onViewCertificate(course, enrollmentProgress.examScore, enrollmentProgress.examDate, enrollmentProgress.certificateId);
                              }
                            }}
                            className="bg-[#0a2540] hover:bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
                          >
                            Visualizar Certificado Digital
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Failed, under 80% */
                      <div className="p-5 bg-rose-50 border border-rose-200 rounded-sm text-left space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono uppercase bg-rose-100 text-rose-850 px-2 py-0.5 rounded-sm font-bold">
                            ⚠️ Exame Não Aprovado
                          </span>
                          <h4 className="font-display font-bold text-rose-900 text-sm mt-2">
                            Obteve {enrollmentProgress.examScore}% de aproveitamento (Necessita de 80%).
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">
                            Não atingiu o limite mínimo exigido para certificação de 80% (mínimo de 16 respostas certas). Pode rever o conteúdo do curso e tentar novamente o exame a qualquer momento.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartExam}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
                        >
                          Refazer Exame Final
                        </button>
                      </div>
                    )
                  ) : isExamActive ? (
                    /* User is taking the exam */
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-sm text-left space-y-6" id="exam-taker-container">
                      <div className="space-y-1 border-b border-slate-200 pb-3">
                        <h4 className="font-display font-bold text-[#0a2540] text-sm">Exame Final de Avaliação</h4>
                        <p className="text-xs text-slate-500">
                          Responda com atenção às {activeExamQuestions.length} perguntas de escolha múltipla abaixo.
                        </p>
                      </div>

                      {examFeedbackError && (
                        <div className="p-3 bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold rounded-sm">
                          {examFeedbackError}
                        </div>
                      )}

                      <div className="space-y-6">
                        {activeExamQuestions.map((q, idx) => (
                          <div key={q.id} className="space-y-3" id={`exam-q-${q.id}`}>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                              Questão {idx + 1} de {activeExamQuestions.length}
                            </span>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
                              {q.question}
                            </p>
                            <div className="space-y-2 max-w-2xl">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = examAnswers[idx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => setExamAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                                    className={`w-full text-left p-2.5 text-xs rounded-sm border transition-colors flex items-start gap-2.5 cursor-pointer ${
                                      isSelected
                                        ? "bg-[#0d9488]/10 border-[#0d9488] text-[#0d9488] font-bold"
                                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    <span className={`font-mono font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                                      isSelected ? "bg-[#0d9488] text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsExamActive(false);
                            setExamAnswers({});
                            setExamFeedbackError("");
                          }}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-350 text-slate-705 font-bold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer border"
                        >
                          Cancelar Exame
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitFinalExam}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] py-3 rounded-sm cursor-pointer text-center"
                        >
                          Submeter Respostas
                        </button>
                      </div>
                    </div>
                  ) : examQuestionsAvailable.length === 0 ? (
                    /* No exam questions registered yet for this course */
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-sm text-left space-y-2">
                      <div className="flex items-start gap-2.5">
                        <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-display font-bold text-amber-900 text-sm">Exame Final em Preparação</h4>
                          <p className="text-xs text-amber-800 leading-relaxed font-sans mt-1">
                            O administrador da plataforma ainda não cadastrou perguntas para o exame final deste curso. As perguntas serão adicionadas em breve no Painel Admin.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Not started yet, questions exist */
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-sm text-left space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Exame Requerido para Certificação</span>
                        <p className="text-xs text-slate-500 max-w-xl leading-relaxed font-sans">
                          Conclua a sua avaliação teórica para emitir as credenciais. O exame consiste em {examQuestionsAvailable.length} questão(ões) de escolha múltipla baseadas nas lições, com pontuação mínima de 80% para aprovação.
                        </p>
                      </div>
                      
                      <div className="bg-[#0a2540]/5 p-3.5 border border-slate-200 rounded-sm text-xs text-slate-650 max-w-xl">
                        🎓 <strong>Direito a Certificado Físico:</strong> Ao obter aprovação, você terá direito a receber o seu <strong>certificado de conclusão físico oficial</strong> enviado de forma gratuita à sua residência.
                      </div>

                      <button
                        type="button"
                        onClick={handleStartExam}
                        className="bg-[#0a2540] hover:bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-sm transition-colors cursor-pointer"
                      >
                        Iniciar Exame Final
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start" id="modal-split-layout">
                {/* Left Frame: Image & Instructor */}
                <div className="md:col-span-5 space-y-4 text-left" id="modal-split-left">
                  <div className="relative w-full aspect-video md:aspect-card bg-slate-100 border border-slate-150 rounded-sm overflow-hidden animate-fade-in" id="modal-image-wrapper">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Instructor profile card */}
                  <div className="p-4 border border-slate-100 rounded-sm space-y-2" id="modal-instructor-wrap">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold">Formador do Curso</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-[#0d9488]" id="instructor-avatar">
                        {course.instructorAvatar || course.instructorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{course.instructorName}</span>
                        <span className="text-[10px] text-slate-500 leading-none mt-0.5">{course.instructorTitle || "Formador Certificado"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Non enrolled syllabus locks announcement */}
                  <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 space-y-3" id="syllabus-lock-block">
                    <span className="text-[10px] font-mono uppercase bg-slate-200/50 text-slate-700 px-2 py-0.5 rounded-sm inline-block font-bold">
                      Estrutura Curricular ({associatedVideos.length} Aulas)
                    </span>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">
                      Este plano instrucional aborda lições práticas fundamentadas em projetos e integra questionários para provar o seu domínio.
                    </p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto" id="mini-lessons-list">
                      {associatedVideos.map((v) => (
                        <div key={v.id} className="flex items-center justify-between gap-1.5 text-xs text-slate-550 font-sans py-1 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{v.title}</span>
                          </div>
                          <span className="font-mono text-[9px] text-slate-400 shrink-0">{v.duration} min</span>
                        </div>
                      ))}
                      {associatedVideos.length === 0 && (
                        <span className="text-xs text-slate-400 block italic">Nenhuma lição em vídeo publicada ainda.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Frame: Long Descriptions & Objectives */}
                <div className="md:col-span-7 space-y-4 text-left" id="modal-split-right">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block mb-1">
                      Resumo da Capacitação
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed font-sans mt-1">
                      {course.description}
                    </p>
                  </div>

                  {/* Metrics detail table list */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-sm text-xs font-sans text-slate-600">
                    <div>Capacidade de Aulas: <strong className="text-slate-800 font-mono font-semibold">{course.lessonsCount}</strong></div>
                    <div>Estudantes Inscritos: <strong className="text-slate-800 font-sans font-semibold">{(course.enrolledStudentsCount || 0).toLocaleString()}</strong></div>
                    <div>Rating de Satisfação: <strong className="text-slate-800 font-mono font-semibold">{course.rating.toFixed(1)} / 5.0</strong></div>
                    <div>Custo Financiamento: <strong className="text-[#0d9488] font-bold">{course.price === 0 ? "Acesso Gratuito" : `${course.price.toLocaleString("pt-PT")} MT`}</strong></div>
                  </div>

                  {/* Skills Cover List */}
                  {course.skillsCovered && course.skillsCovered.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#0e7490] block">
                        Competências Práticas de Saída:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.skillsCovered.map((skill, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 text-xs text-slate-600 border border-slate-100 p-2 rounded-xs bg-slate-50/30"
                          >
                            <ShieldCheck className="h-4 w-4 text-[#0d9488] shrink-0" />
                            <span className="truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quizzes Preview List */}
                  {associatedQuizzes.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#0e7490] block">
                        Avaliações de Consolidação ({associatedQuizzes.length}):
                      </span>
                      <div className="space-y-2 border border-slate-150 rounded-sm p-4 bg-slate-50/50">
                        {associatedQuizzes.map((quiz, i) => (
                          <div key={quiz.id} className="text-xs space-y-1 border-b border-slate-100 last:border-none pb-2 last:pb-0" id={`preview-quiz-${quiz.id}`}>
                            <div className="flex items-start gap-1.5 font-sans">
                              <Lock className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="font-semibold text-slate-700">Pergunta {i + 1}: {quiz.question}</span>
                            </div>
                            <div className="pl-4.5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-500 font-mono">
                              {quiz.options.map((opt, oIdx) => (
                                <div key={oIdx} className="truncate">• {opt}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrollment Guard notice */}
                  {!currentUser ? (
                    <div className="bg-[#0a2540] text-white p-5 rounded-sm space-y-3 mt-4" style={{ padding: "32px block" }}>
                      <h4 className="text-xs font-bold font-mono text-[#0d9488] uppercase tracking-wider">Acesso Exclusivo para Alunos</h4>
                      <p className="text-xs text-slate-350 leading-normal font-sans">
                        Necessita de efetuar o seu registo ou iniciar sessão para subscrever esta formação, desfrutar de todas as aulas em vídeo e submeter as avaliações de consolidação.
                      </p>
                      <button
                        type="button"
                        onClick={onTriggerAuth}
                        className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors cursor-pointer"
                      >
                        <span>Aceder para Matricular</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-teal-50 border border-teal-100 p-5 rounded-sm space-y-3 mt-4 text-slate-800">
                      <h4 className="text-xs font-bold text-[#0e7490] uppercase tracking-wider">Pronto para Começar?</h4>
                      <p className="text-xs text-slate-600 leading-normal font-sans">
                        A sua conta de estudante está pronta para iniciar este curso. Confirme a sua inscrição abaixo de forma imediata.
                      </p>
                      <button
                        type="button"
                        onClick={() => onEnrollCourse(course.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-sm transition-colors cursor-pointer"
                      >
                        <BookmarkCheck className="h-4 w-4" />
                        <span>Confirmar Inscrição no Curso</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer controls layout inside 40px padding target */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between" id="modal-footer-wrapper">
          <div className="text-left select-none">
            <span className="text-[10px] text-slate-400 font-mono block">CURSAQI • CURSOS DE INFORMÁTICA // FORMADOR ALDO VALIGE</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onToggleWishlist(course.id)}
              className={`py-2 px-4 rounded-sm border cursor-pointer text-xs font-bold tracking-wider uppercase transition-colors ${
                isWishlisted
                  ? "border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100 bg-white"
              }`}
              id="modal-wishlist-toggle-btn"
            >
              {isWishlisted ? "Favorito" : "Adicionar aos Favoritos"}
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-[#0a2540] hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase rounded-sm cursor-pointer transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
