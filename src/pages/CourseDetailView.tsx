import React, { useState } from "react";
import { ArrowLeft, Clock, PlayCircle, BookOpen, User, ShieldCheck, Lock, CheckCircle, Download, FileText, FileCode, AlertTriangle, Award, Share2, Copy, Check } from "lucide-react";

import { Course, CourseVideo, UserProfile, DidacticMaterial, PaymentTicket } from "../types";
import { copyToClipboard, getFullShareUrl } from "../utils/shareUtils";

interface CourseDetailViewProps {
  course: Course;
  videos: CourseVideo[];
  currentUser: UserProfile | null;
  onEnroll: (courseId: string) => void;
  onGoBack: () => void;
  isEnrolled: boolean;
  onOpenStudyModal: (videoId?: string) => void;
  onLoginTrigger: () => void;
  onTriggerNotification?: (type: string, title?: string, message?: string) => void;
  materials: DidacticMaterial[];
  paymentTickets?: PaymentTicket[];
  onBuy?: (course: Course) => void;
  onShare?: (course: Course) => void;
}

export default function CourseDetailView({
  course,
  videos,
  currentUser,
  onEnroll,
  onGoBack,
  isEnrolled,
  onOpenStudyModal,
  onLoginTrigger,
  onTriggerNotification,
  materials,
  paymentTickets = [],
  onBuy,
  onShare,
}: CourseDetailViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const url = getFullShareUrl(course.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      if (onTriggerNotification) {
        onTriggerNotification("com_energia", "Ligação Copiada!", "O link deste curso foi copiado para a área de transferência.");
      }
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };
  const courseVideos = videos.filter((v) => v.courseId === course.id);

  // Access control for materials:
  // Materials are locked if: course is paid AND user is not enrolled
  // Enrollment happens either via: free course enroll, OR approved payment ticket
  const isPaidCourse = course.price > 0;
  const isMaterialsRestricted = isPaidCourse && !isEnrolled;


  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-8 px-4 text-left" id="course-details-page">
      <div className="w-full max-w-5xl mx-auto space-y-8" id="course-details-wrapper">
        
        {/* Navigation Action link & Social Share */}
        <div className="flex flex-wrap items-center justify-between gap-4" id="course-details-nav-row">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            id="course-details-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Lista de Cursos</span>
          </button>

          {/* Social Share & Copy Link Actions */}
          <div className="flex items-center gap-2" id="course-share-actions-top">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm border transition-all cursor-pointer ${
                copiedLink
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 shadow-2xs"
              }`}
              title="Copiar ligação do curso"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Link Copiado!" : "Copiar Link"}</span>
            </button>

            {onShare && (
              <button
                type="button"
                onClick={() => onShare(course)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#0a2540] hover:bg-[#0d9488] text-white transition-colors cursor-pointer shadow-2xs"
                title="Partilhar curso nas redes sociais"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Partilhar</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Course Presentation Card */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch" id="course-jumbotron-wrapper">
          {/* Cover picture */}
          <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-slate-100 relative">
            <img
              src={course.image}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Absolute price pill badge */}
            <div className="absolute top-4 left-4">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-xs border shadow-sm ${
                isPaidCourse 
                  ? "bg-amber-55 bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
              }`}>
                {isPaidCourse ? "Curso Premium" : "Acesso Livre"}
              </span>
            </div>
          </div>

          {/* Details header textual section */}
          <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-between" id="course-jumbo-content">
            <div className="space-y-3">
              <span className="text-[10px] bg-slate-100 text-[#0d9488] px-2.5 py-1 rounded-sm uppercase font-mono font-bold tracking-wider inline-block">
                Especialização: {course.category}
              </span>
              
              <h1 className="font-display font-bold text-2xl md:text-3xl text-[#0a2540] tracking-tight">
                {course.title}
              </h1>

              <div className="w-12 h-[2.5px] bg-[#0d9488]" />

              <div className="flex flex-wrap gap-4 text-slate-500 text-xs font-sans mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Formador: <strong className="text-slate-700 font-bold">{course.instructorName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Carga: <strong className="text-slate-700 font-bold">{course.lessonsCount * 15} minutos</strong></span>
                </div>
              </div>
            </div>

            {/* Dynamic CTAs block depending on enrollment status */}
            <div className="pt-6 mt-6 border-t border-slate-150 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4" id="course-cta-region">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Valor do Curso</span>
                <span className="text-xl font-mono font-black text-slate-900 leading-none">
                  {isPaidCourse ? `${course.price.toLocaleString("pt-PT")} MT` : "GRATUITO"}
                </span>
              </div>

              {currentUser ? (
                isEnrolled ? (
                  <button
                    onClick={() => onOpenStudyModal()}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 font-sans"
                    id="course-resume-learning"
                  >
                    <PlayCircle className="h-4.5 w-4.5" />
                    <span>Estudar Agora (Ver Vídeos & Responder Quizzes)</span>
                  </button>
                ) : isPaidCourse ? (
                  (() => {
                    const ticket = paymentTickets.find(t => t.courseId === course.id);
                    if (ticket && (ticket.status === "PENDING" || ticket.status === "UNDER_REVIEW")) {
                      return (
                        <button
                          disabled
                          className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-not-allowed inline-flex items-center justify-center gap-2 font-sans"
                          id="course-payment-pending"
                        >
                          <Clock className="h-4.5 w-4.5 animate-pulse" />
                          <span>Pagamento em análise</span>
                        </button>
                      );
                    }
                    if (ticket && ticket.status === "REJECTED") {
                      return (
                        <button
                          onClick={() => onBuy?.(course)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 font-sans"
                          id="course-buy-retry"
                        >
                          <AlertTriangle className="h-4.5 w-4.5" />
                          <span>Comprar Curso (Tentar Novamente)</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => onBuy?.(course)}
                        className="bg-[#0a2540] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 font-sans"
                        id="course-buy-now"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>Comprar Curso</span>
                      </button>
                    );
                  })()
                ) : (
                  <button
                    onClick={() => onEnroll(course.id)}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 font-sans"
                    id="course-enroll-free"
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>Estudar Agora</span>
                  </button>
                )
              ) : (
                <button
                  onClick={onLoginTrigger}
                  className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-md cursor-pointer text-center font-sans"
                  id="course-login-to-enroll"
                >
                  Entrar na Conta para se Matricular
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Triple Layout block: Detailed info, Course videos list, restricted resources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="course-split-bottom">
          
          {/* Left Block (7 columns): Detailed description & Curriculum modules list */}
          <div className="lg:col-span-7 space-y-6" id="course-curriculum-block">
            
            {/* Detailed Description */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs space-y-4">
              <h3 className="font-display font-extrabold text-[#0a2540] text-lg border-b border-slate-100 pb-3">
                Descrição Detalhada do Curso
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-normal whitespace-pre-line">
                {course.description || "Este curso oferece ferramentas práticas, explicações diretas e exercícios passo a passo para dominar a informática e a tecnologia com o Formador Aldo Valige."}
                {"\n\nAprenda na prática com cenários reais para consolidar o seu conhecimento prático em informática."}
              </p>

              {/* Skills covered pills */}
              <div className="pt-4" id="skills-pills-panel">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2.5">Competências Desenvolvidas:</span>
                <div className="flex flex-wrap gap-2">
                  {course.skillsCovered?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-sm text-xs font-semibold select-none transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modules and video list index */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-sm shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="font-display font-extrabold text-[#0a2540] text-lg">
                  Módulos e Aulas em Vídeo ({courseVideos.length})
                </h3>
                <span className="text-xs text-slate-500 font-mono">Duração Total Estimada</span>
              </div>

              {courseVideos.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-sm text-center text-xs text-slate-400 font-sans">
                  Nenhuma aula em vídeo ou módulo prático foi inserido pelo tutor administrativo para este curso.
                </div>
              ) : (
                <div className="divide-y divide-slate-100" id="curriculum-interactive-list">
                  {courseVideos.map((vid, index) => (
                    <button
                      key={vid.id}
                      onClick={() => {
                        if (isEnrolled) {
                          onOpenStudyModal(vid.id);
                        } else {
                          if (currentUser) {
                            if (onTriggerNotification) {
                              onTriggerNotification("preso", "Matrícula Necessária", "Matricule-se no curso para assistir a esta aula.");
                            }
                            alert("[CURSAQI] Matricule-se no curso para assistir a esta aula.");
                          } else {
                            onLoginTrigger();
                          }
                        }
                      }}
                      className="w-full text-left py-3 flex items-center justify-between text-xs gap-4 font-sans hover:bg-slate-50 px-2 transition-colors rounded-xs cursor-pointer border-0 bg-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700 hover:text-[#0d9488] transition-colors">{vid.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">{vid.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Block (5 columns): restricted assets download list */}
          <div className="lg:col-span-5 space-y-6" id="course-materials-block">
            
            {/* MATERIAIS DIDÁTICOS (With restricted member limits specified in user query) */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs space-y-4" id="didactic-section-holder">
              <div>
                <h3 className="font-display font-bold text-base text-[#0a2540]">Materiais Didáticos</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Recursos e ficheiros complementares de estudo</p>
              </div>

              {isMaterialsRestricted ? (
                /* LOCKED PANEL: user is not enrolled in this paid course */
                <div className="bg-slate-50 border-2 border-dashed border-red-200 p-6 rounded-sm text-center space-y-4 shadow-3xs" id="materials-locked-banner">
                  <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center mx-auto shadow-2xs">
                    <Lock className="h-6 w-6 stroke-2" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-rose-800">Acesso Restrito a Inscritos</h4>
                    <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                      Este é um curso pago. O descarregamento de manuais, tarefas em PDF e ficheiros de código é <strong className="font-bold text-slate-800">exclusivo para alunos inscritos</strong> neste curso.
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 font-sans italic leading-tight">
                        Adquira o curso via Ticket de Pagamento (M-Pesa ou e-Mola) e, após validação pelo administrador, os materiais ficarão automaticamente disponíveis.
                      </p>
                    </div>
                    {currentUser && onBuy && (
                      <div className="pt-3">
                        <button
                          onClick={() => onBuy(course)}
                          className="px-4 py-2 bg-[#0a2540] hover:bg-[#0d9488] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-all inline-flex items-center gap-2"
                          id="locked-materials-buy-btn"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Comprar para Desbloquear Materiais
                        </button>
                      </div>
                    )}
                    {!currentUser && (
                      <div className="pt-3">
                        <button
                          onClick={onLoginTrigger}
                          className="px-4 py-2 border border-rose-300 hover:border-rose-600 bg-rose-50 text-rose-850 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-all"
                          id="locked-login-trigger-btn"
                        >
                          Iniciar Sessão para Comprar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* UNLOCKED PANELS for free/unrestricted programs or paid with premium subscription plan active */
                <div className="space-y-3" id="materials-unlocked-list">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xs text-[10px] font-sans font-semibold mb-2">
                    Acesso Concedido: Descarregamento e consulta de materiais liberados com êxito para a sua conta.
                  </div>

                  {materials.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm text-center text-xs text-slate-400 font-sans">
                      Nenhum material didático foi cadastrado na base de dados para este curso.
                    </div>
                  ) : (
                    materials.map((material, index) => (
                      <div
                        key={material.id}
                        className="border border-slate-150 p-3 rounded-xs hover:bg-slate-50 hover:border-slate-350 transition-all flex items-center justify-between text-left gap-4"
                        id={`material-asset-${material.id}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4.5 w-4.5 text-[#0d9488] shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-sans font-bold text-xs text-slate-700 truncate">{material.name}</h4>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">{material.size} • {material.type}</span>
                          </div>
                        </div>

                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white border border-slate-200 rounded-sm cursor-pointer transition-colors inline-flex items-center"
                          title="Visualizar / Baixar material didático"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Pedagógico regulations metadata */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm text-xs text-slate-500 space-y-3" id="didactic-regulations">
              <h4 className="font-mono font-bold uppercase tracking-wider text-[#0a2540] text-[10px]">Apoio ao Estudante</h4>
              <p className="font-sans leading-normal text-[11px] text-slate-400">
                Se possuir dificuldades no escoamento do conteúdo ou na interpretação das aulas teóricas, use os canais de contacto Whatsapp do formador {course.instructorName} para auxílio imediato.
              </p>
            </div>

            {/* Physical Certificate info panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm text-xs text-slate-555 space-y-3" id="physical-certificate-promo-panel">
              <h4 className="font-mono font-bold uppercase tracking-wider text-[#0a2540] text-[10px] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#0d9488]" />
                Direito a Certificado Físico
              </h4>
              <p className="font-sans leading-normal text-[11px] text-slate-600">
                Ao concluir com sucesso todas as lições deste curso e obter aprovação no Exame Final (aproveitamento mínimo de 80%), você terá direito a receber o seu <strong>certificado de conclusão físico</strong> do curso ministrado pelo Formador Aldo Valige. O documento será enviado para a morada registada na sua conta.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
