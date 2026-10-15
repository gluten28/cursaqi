import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, ArrowLeft, RotateCcw, BookOpen, Settings, Tag, Film, Users, Megaphone, Save, DollarSign, Loader2, HelpCircle, FileText, Download, Headphones, MessageCircle, Send, Search, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { Course, Category, CourseVideo, Quiz, PromoBanner, UserProfile, PaymentMethod, PaymentTicket, DidacticMaterial, ChatMessage } from "../../types";
import { extractWistiaId } from "../../utils/videoUtils";
import AdminFinanceView from "./AdminFinanceView";
import { dbUploadBannerImage, dbGetChatMessages, dbSendChatMessage, dbSubscribeToChat } from "../../supabase";

interface AdminPanelProps {
  courses: Course[];
  categories: Category[];
  videos: CourseVideo[];
  quizzes: Quiz[];
  materials: DidacticMaterial[];
  banners: PromoBanner[];
  users: UserProfile[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddVideo: (video: CourseVideo) => void;
  onDeleteVideo: (videoId: string) => void;
  onUpdateVideo: (video: CourseVideo) => void;
  onAddQuiz: (quiz: Quiz) => void;
  onUpdateQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onAddMaterial: (material: DidacticMaterial) => void;
  onUpdateMaterial: (material: DidacticMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onAddBanner: (banner: PromoBanner) => Promise<void> | void;
  onUpdateBanner: (banner: PromoBanner) => Promise<void> | void;
  onDeleteBanner: (bannerId: string) => Promise<void> | void;
  onUpdateUserProfile: (profile: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  paymentTickets: PaymentTicket[];
  onUpdateTicketStatus: (ticketId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", adminNotes: string) => Promise<void>;
  onSavePaymentMethod: (method: PaymentMethod) => Promise<void>;
  currentUser: UserProfile;
}

type AdminTab = "courses" | "categories" | "videos" | "quizzes" | "materials" | "banners" | "users" | "finance" | "support";

export default function AdminPanel({
  courses,
  categories,
  videos,
  quizzes,
  materials,
  banners,
  users,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddCategory,
  onDeleteCategory,
  onAddVideo,
  onDeleteVideo,
  onUpdateVideo,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onUpdateUserProfile,
  onDeleteUser,
  onClose,
  paymentMethods,
  paymentTickets,
  onUpdateTicketStatus,
  onSavePaymentMethod,
  currentUser,
}: AdminPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>("courses");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- COURSE FORM STATE ---
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCategory, setCourseCategory] = useState(categories[0]?.id || "development");
  const [courseTag, setCourseTag] = useState("DEVELOPMENT");
  const [courseInstructorName, setCourseInstructorName] = useState("");
  const [courseInstructorTitle, setCourseInstructorTitle] = useState("");
  const [courseLessonsCount, setCourseLessonsCount] = useState<number>(10);
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseSkillsCsv, setCourseSkillsCsv] = useState("");

  const coverImagePresets = [
    { name: "Tech / Code", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop" },
    { name: "Business / Finance", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop" },
    { name: "Language / Study", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop" },
    { name: "Science / Research", url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop" },
  ];

  // --- CATEGORY FORM STATE ---
  const [numCategoryName, setNumCategoryName] = useState("");
  const [numCategoryIcon, setNumCategoryIcon] = useState("Code");

  // --- VIDEO FORM STATE ---
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [videoCourseId, setVideoCourseId] = useState("");

  const [videoPreviewId, setVideoPreviewId] = useState("");
  const [videoValid, setVideoValid] = useState(false);

  const handleVideoEditStart = (target: CourseVideo) => {
    setEditingVideoId(target.id);
    setVideoTitle(target.title);
    setVideoUrl(`https://fast.wistia.net/embed/iframe/${target.videoUrl}`);
    setVideoDuration(target.duration);
    setVideoCourseId(target.courseId);
    setVideoPreviewId(target.videoUrl);
    setVideoValid(true);
  };

  const handleVideoReset = () => {
    setEditingVideoId(null);
    setVideoTitle("");
    setVideoUrl("");
    setVideoDuration("");
    setVideoCourseId("");
    setVideoPreviewId("");
    setVideoValid(false);
  };

  //Funcao de validacao
  const handleVideoUrlChange = (value: string) => {

    setVideoUrl(value);

    const mediaId = extractWistiaId(value);

    if (mediaId) {

        setVideoPreviewId(mediaId);

        setVideoValid(true);

    } else {
        setVideoPreviewId("");
        setVideoValid(false);
    }
  };

  // --- VIDEO LIST COURSE GROUPING & SEARCH ---
  const [selectedCourseVideoFilter, setSelectedCourseVideoFilter] = useState<string>("ALL");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");

  // --- SUPPORT MESSAGES STATE ---
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    async function loadSupport() {
      try {
        const allMsgs = await dbGetChatMessages();
        setSupportMessages(allMsgs.filter(m => m.category === "suporte"));
      } catch (e) {
        console.error("Erro ao carregar mensagens de suporte no admin:", e);
      }
    }
    loadSupport();

    const unsub = dbSubscribeToChat((newM) => {
      if (newM.category === "suporte") {
        setSupportMessages((prev) => {
          if (prev.some(m => m.id === newM.id)) return prev;
          return [...prev, newM];
        });
      }
    });

    return () => unsub();
  }, []);

  const handleSendSupportReply = async (originalMsg?: ChatMessage) => {
    if (!replyText.trim() || isSendingReply) return;
    setIsSendingReply(true);
    try {
      const authorName = currentUser?.fullName || "Formador Aldo Valige (Admin)";
      const prefix = originalMsg ? `@${originalMsg.authorName}: ` : "";
      const created = await dbSendChatMessage({
        userId: currentUser?.id,
        authorName: authorName,
        authorRole: "formador",
        message: prefix + replyText.trim(),
        category: "suporte"
      });
      if (created) {
        setSupportMessages((prev) => {
          if (prev.some(m => m.id === created.id)) return prev;
          return [...prev, created];
        });
        setReplyText("");
        setReplyingToMessageId(null);
        triggerAlert("success", "Resposta de suporte enviada com sucesso.");
      }
    } catch (e) {
      triggerAlert("error", "Erro ao responder mensagem de suporte.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // --- QUIZ FORM STATE ---
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizCourseId, setQuizCourseId] = useState<string>("");
  const [quizType, setQuizType] = useState<"quiz" | "exam">("quiz");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptionA, setQuizOptionA] = useState("");
  const [quizOptionB, setQuizOptionB] = useState("");
  const [quizOptionC, setQuizOptionC] = useState("");
  const [quizOptionD, setQuizOptionD] = useState("");
  const [quizCorrectIndex, setQuizCorrectIndex] = useState<number>(0);
  const [quizFilterCourseId, setQuizFilterCourseId] = useState<string>("ALL");
  const [quizFilterType, setQuizFilterType] = useState<"ALL" | "quiz" | "exam">("ALL");

  const handleQuizEditStart = (target: Quiz) => {
    setEditingQuizId(target.id);
    setQuizCourseId(target.courseId);
    setQuizType(target.type === "exam" ? "exam" : "quiz");
    setQuizQuestion(target.question);
    setQuizOptionA(target.options[0] || "");
    setQuizOptionB(target.options[1] || "");
    setQuizOptionC(target.options[2] || "");
    setQuizOptionD(target.options[3] || "");
    setQuizCorrectIndex(target.correctIndex || 0);
  };

  const handleQuizReset = () => {
    setEditingQuizId(null);
    setQuizCourseId(courses[0]?.id || "");
    setQuizType("quiz");
    setQuizQuestion("");
    setQuizOptionA("");
    setQuizOptionB("");
    setQuizOptionC("");
    setQuizOptionD("");
    setQuizCorrectIndex(0);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourseId = quizCourseId || courses[0]?.id;
    if (!targetCourseId || !quizQuestion.trim() || !quizOptionA.trim() || !quizOptionB.trim()) {
      triggerAlert("error", "Preencha o curso, enunciado da pergunta e pelo menos as opções A e B.");
      return;
    }

    const opts: string[] = [quizOptionA.trim(), quizOptionB.trim()];
    if (quizOptionC.trim()) opts.push(quizOptionC.trim());
    if (quizOptionD.trim()) opts.push(quizOptionD.trim());

    if (quizCorrectIndex >= opts.length) {
      triggerAlert("error", "A opção correta selecionada precisa ser uma das alternativas preenchidas.");
      return;
    }

    const payload: Quiz = {
      id: editingQuizId || `quiz-${Date.now()}`,
      courseId: targetCourseId,
      question: quizQuestion.trim(),
      options: opts,
      correctIndex: quizCorrectIndex,
      type: quizType,
    };

    if (editingQuizId) {
      onUpdateQuiz(payload);
      triggerAlert("success", quizType === "exam" ? "Pergunta de Exame Final atualizada com sucesso." : "Pergunta do Quiz de Aula atualizada com sucesso.");
    } else {
      onAddQuiz(payload);
      triggerAlert("success", quizType === "exam" ? "Pergunta de Exame Final cadastrada com sucesso." : "Pergunta do Quiz de Aula cadastrada com sucesso.");
    }
    handleQuizReset();
  };

  // --- DIDACTIC MATERIAL FORM STATE ---
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialCourseId, setMaterialCourseId] = useState<string>("");
  const [materialName, setMaterialName] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [materialSize, setMaterialSize] = useState("2.5 MB");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialFilterCourseId, setMaterialFilterCourseId] = useState<string>("ALL");

  const samplePdfPresets = [
    { name: "Dummy PDF Test", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    { name: "Mozilla Sample PDF", url: "https://pdfobject.com/pdf/sample.pdf" }
  ];

  const handleMaterialEditStart = (target: DidacticMaterial) => {
    setEditingMaterialId(target.id);
    setMaterialCourseId(target.courseId);
    setMaterialName(target.name);
    setMaterialType(target.type || "pdf");
    setMaterialSize(target.size || "2.5 MB");
    setMaterialUrl(target.url || "");
  };

  const handleMaterialReset = () => {
    setEditingMaterialId(null);
    setMaterialCourseId(courses[0]?.id || "");
    setMaterialName("");
    setMaterialType("pdf");
    setMaterialSize("2.5 MB");
    setMaterialUrl("");
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourseId = materialCourseId || courses[0]?.id;
    if (!targetCourseId || !materialName.trim() || !materialUrl.trim()) {
      triggerAlert("error", "Preencha o curso, nome do material e URL/link de acesso PDF.");
      return;
    }

    const payload: DidacticMaterial = {
      id: editingMaterialId || `mat-${Date.now()}`,
      courseId: targetCourseId,
      name: materialName.trim(),
      type: materialType.trim() || "pdf",
      size: materialSize.trim() || "0 KB",
      url: materialUrl.trim(),
    };

    if (editingMaterialId) {
      onUpdateMaterial(payload);
      triggerAlert("success", "Material didático em PDF atualizado com sucesso.");
    } else {
      onAddMaterial(payload);
      triggerAlert("success", "Material didático em PDF cadastrado com sucesso.");
    }
    handleMaterialReset();
  };

  // --- BANNER FORM STATE ---
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerButtonText, setBannerButtonText] = useState("");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerCourseId, setBannerCourseId] = useState<string>("");
  const [bannerLinkUrl, setBannerLinkUrl] = useState<string>("");

  // --- STUDENTS FORM STATE (ADMIN CAN EDIT FREE FORM) ---
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userWhatsapp, setUserWhatsapp] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "user">("user");

  // Notification Timer helper
  const triggerAlert = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // COURSE ACTIONS
  const handleCourseEditStart = (target: Course) => {
    setEditingCourseId(target.id);
    setCourseTitle(target.title);
    setCourseCategory(target.category);
    setCourseTag(target.tag);
    setCourseInstructorName(target.instructorName);
    setCourseInstructorTitle(target.instructorTitle || "");
    setCourseLessonsCount(target.lessonsCount);
    setCoursePrice(target.price);
    setCourseImageUrl(target.image);
    setCourseDescription(target.description);
    setCourseSkillsCsv(target.skillsCovered ? target.skillsCovered.join(", ") : "");
  };

  const handleCourseReset = () => {
    setEditingCourseId(null);
    setCourseTitle("");
    setCourseCategory(categories[0]?.id || "development");
    setCourseTag("DEVELOPMENT");
    setCourseInstructorName("");
    setCourseInstructorTitle("");
    setCourseLessonsCount(10);
    setCoursePrice(0);
    setCourseImageUrl("");
    setCourseDescription("");
    setCourseSkillsCsv("");
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseInstructorName.trim() || !courseDescription.trim()) {
      triggerAlert("error", "Preencha todos os campos obrigatórios do curso.");
      return;
    }

    const targetImg = courseImageUrl.trim() || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop";
    const parsedSkills = courseSkillsCsv.split(",").map(s => s.trim()).filter(Boolean);

    const data: Course = {
      id: editingCourseId || `course-${Date.now()}`,
      title: courseTitle.trim(),
      category: courseCategory,
      tag: courseTag.trim().toUpperCase() || "DEVELOPMENT",
      lessonsCount: Number(courseLessonsCount) || 12,
      price: Number(coursePrice) >= 0 ? Number(coursePrice) : 0,
      instructorName: courseInstructorName.trim(),
      instructorTitle: courseInstructorTitle.trim() || "Especialista Reconhecido",
      instructorAvatar: courseInstructorName.slice(0, 2).toUpperCase(),
      image: targetImg,
      description: courseDescription.trim(),
      enrolledStudentsCount: editingCourseId 
        ? courses.find(c => c.id === editingCourseId)?.enrolledStudentsCount || 80 
        : 80,
      rating: editingCourseId 
        ? courses.find(c => c.id === editingCourseId)?.rating || 4.8 
        : 4.8,
      skillsCovered: parsedSkills.length > 0 ? parsedSkills : ["Conhecimento Prático", "Habilidades Técnicas"],
    };

    if (editingCourseId) {
      onUpdateCourse(data);
      triggerAlert("success", "O curso foi atualizado com sucesso.");
    } else {
      onAddCourse(data);
      triggerAlert("success", "Novo curso publicado com sucesso.");
    }
    handleCourseReset();
  };

  // CATEGORY ACTIONS
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numCategoryName.trim()) {
      triggerAlert("error", "O nome da categoria é obrigatório.");
      return;
    }
    const catId = numCategoryName.trim().toLowerCase().replace(/\s+/g, "-");
    const newCat: Category = {
      id: catId,
      name: numCategoryName.trim(),
      iconName: numCategoryIcon,
      count: 0,
    };
    onAddCategory(newCat);
    setNumCategoryName("");
    triggerAlert("success", "Categoria de cursos adicionada com sucesso.");
  };

  // VIDEO ACTIONS
  const handleVideoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!videoTitle.trim() || !videoUrl.trim() || !videoCourseId) {
          triggerAlert(
              "error",
              "Preencha todos os campos obrigatórios."
          );
          return;
      }
      const mediaId = extractWistiaId(videoUrl);
      if (!mediaId) {
          triggerAlert(
              "error",
              "O link da Wistia é inválido."
          );
          return;
      }
      const chunk: CourseVideo = {
          id: editingVideoId || `vid-${Date.now()}`,
          courseId: videoCourseId,
          title: videoTitle.trim(),
          videoUrl: mediaId,
          duration: videoDuration.trim() || "15:00",
      };
      if (editingVideoId) {
          onUpdateVideo(chunk);
          triggerAlert(
              "success",
              "Vídeo atualizado com sucesso."
          );
      } else {
          onAddVideo(chunk);
          triggerAlert(
              "success",
              "Vídeo adicionado com sucesso."
          );
      }
      handleVideoReset();
  };

  // ANÚNCIOS / BANNER ACTIONS
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      triggerAlert("error", "Preencha o título do anúncio.");
      return;
    }

    if (!editingBannerId && !bannerImageFile && !bannerImageUrl.trim()) {
      triggerAlert("error", "Por favor, selecione ou insira uma imagem para o anúncio.");
      return;
    }

    setUploadingBanner(true);
    let finalImageUrl = bannerImageUrl;

    try {
      if (bannerImageFile) {
        const uploadedUrl = await dbUploadBannerImage(bannerImageFile);
        if (!uploadedUrl) {
          triggerAlert("error", "Erro ao processar a imagem do anúncio.");
          setUploadingBanner(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      const item: PromoBanner = {
        id: editingBannerId || `ad-${Date.now()}`,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        buttonText: bannerButtonText.trim() || "Saber Mais",
        isActive: bannerIsActive,
        imageUrl: finalImageUrl,
        courseId: bannerCourseId || undefined,
        linkUrl: bannerLinkUrl.trim() || undefined,
      };

      if (editingBannerId) {
        await onUpdateBanner(item);
        triggerAlert("success", "Anúncio atualizado com sucesso.");
      } else {
        await onAddBanner(item);
        triggerAlert("success", "Novo anúncio publicado e salvo com sucesso.");
      }
      
      // Reset form
      setEditingBannerId(null);
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerButtonText("");
      setBannerIsActive(true);
      setBannerImageUrl("");
      setBannerImageFile(null);
      setBannerCourseId("");
      setBannerLinkUrl("");
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Ocorreu um erro ao salvar o anúncio.");
    } finally {
      setUploadingBanner(false);
    }
  };

  // STUDENTS ACTIONS (ADMIN FREE EDIT MODE - o admin pode editar todo perfil de forma livre)
  const handleStudentEditStart = (target: UserProfile) => {
    setEditingUserId(target.id);
    setUserFullName(target.fullName);
    setUserEmail(target.email);
    setUserWhatsapp(target.whatsapp);
    setUserAddress(target.address);
    setUserRole(target.role);
  };

  const handleStudentReset = () => {
    setEditingUserId(null);
    setUserFullName("");
    setUserEmail("");
    setUserWhatsapp("");
    setUserAddress("");
    setUserRole("user");
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    if (!userFullName.trim() || !userEmail.trim() || !userWhatsapp.trim() || !userAddress.trim()) {
      triggerAlert("error", "Todos os campos do usuário são obrigatórios para edição livre.");
      return;
    }

    // Look up original student profile properties to retain enrolled lessons states and wishlists
    const original = users.find(u => u.id === editingUserId);
    if (!original) return;

    const modifiedPayload: UserProfile = {
      ...original,
      fullName: userFullName.trim(),
      email: userEmail.trim().toLowerCase(), // Admins can edit email freely as requested: "o admin pode editar todo perfil de forma livre"
      whatsapp: userWhatsapp.trim(),
      address: userAddress.trim(),
      role: userRole,
    };

    onUpdateUserProfile(modifiedPayload);
    triggerAlert("success", "Perfil do aluno/usuário atualizado com sucesso administrador.");
    handleStudentReset();
  };

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen" id="admin-panel-root" style={{ padding: "32px 16px" }}>
      <div className="w-full max-w-7xl mx-auto space-y-6" id="admin-panel-wrap" style={{ margin: "0 auto" }}>
        
        {/* Ribbon Header bar layout inside 40px constraint */}
        <div className="bg-[#0a2540] text-white border-b border-teal-900 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4" style={{ padding: "32px" }} id="admin-header-ribbon">
          <div className="text-left" id="admin-meta">
            <span className="text-[10px] font-mono tracking-wider text-[#0d9488] font-bold uppercase">
              Consola Administrativa Geral
            </span>
            <h2 className="font-display font-medium text-xl md:text-3xl mt-1 tracking-tight">
              Gerenciador da Plataforma CursaQi
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-sans max-w-xl">
              Acesso irrestrito livre para controle de cursos, atribuição de categorias de ensino, publicação de aulas em vídeo, moderação de estudantes cadastrados e ativação de banners publicitários.
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-sm cursor-pointer transition-colors"
            id="admin-to-site"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Site</span>
          </button>
        </div>

        {/* Status Alerts banner grid */}
        {statusMessage && (
          <div 
            className={`p-4 rounded-sm border flex items-start gap-3 text-left animate-fade-in ${
              statusMessage.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`} 
            id="admin-top-alert"
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-semibold" id="admin-top-alert-msg">{statusMessage.text}</div>
          </div>
        )}

        {/* Secondary Admin Panel Selective Tab bars */}
        <div className="flex flex-wrap items-center border-b border-slate-200 gap-1 text-xs font-bold uppercase tracking-wider" id="admin-tabs">
          <button
            onClick={() => { setActiveTab("courses"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "courses" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Settings className="inline-block h-3.5 w-3.5 mr-1.5" />
            Cursos ({courses.length})
          </button>
          
          <button
            onClick={() => { setActiveTab("categories"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "categories" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tag className="inline-block h-3.5 w-3.5 mr-1.5" />
            Categorias ({categories.length})
          </button>

          <button
            onClick={() => { setActiveTab("videos"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "videos" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Film className="inline-block h-3.5 w-3.5 mr-1.5" />
            Vídeos ({videos.length})
          </button>

          <button
            onClick={() => { setActiveTab("quizzes"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "quizzes" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="inline-block h-3.5 w-3.5 mr-1.5" />
            Quizzes e Exames ({quizzes.length})
          </button>

          <button
            onClick={() => { setActiveTab("materials"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "materials" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="inline-block h-3.5 w-3.5 mr-1.5" />
            Materiais Didáticos ({materials.length})
          </button>

          <button
            onClick={() => { setActiveTab("banners"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "banners" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Megaphone className="inline-block h-3.5 w-3.5 mr-1.5" />
            Anúncios ({banners.length})
          </button>

          <button
            onClick={() => { setActiveTab("users"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "users" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="inline-block h-3.5 w-3.5 mr-1.5" />
            Gerenciar Alunos ({users.length})
          </button>

          <button
            onClick={() => { setActiveTab("finance"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "finance" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <DollarSign className="inline-block h-3.5 w-3.5 mr-1.5" />
            Financeiro ({paymentTickets.filter(t => t.status === "PENDING").length} pendentes)
          </button>

          <button
            onClick={() => { setActiveTab("support"); setStatusMessage(null); }}
            className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "support" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Headphones className="inline-block h-3.5 w-3.5 mr-1.5" />
            Suporte ({supportMessages.length})
          </button>
        </div>

        {/* TAB WORKSPACES FRAMEWORK */}
        
        {/* TAB 1: CURSO DETAILS */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-courses">
            {/* Form editor left block */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                {editingCourseId ? "Editar Propriedades do Curso" : "Especificar Novo Curso"}
              </h3>

              <form onSubmit={handleCourseSubmit} className="space-y-4" id="course-form">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-title">
                    Título do Curso *
                  </label>
                  <input
                    id="c-title"
                    type="text"
                    required
                    placeholder="e.g. Engenharia de Software Moderna"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-tag">
                      Tag Categoria *
                    </label>
                    <input
                      id="c-tag"
                      type="text"
                      required
                      placeholder="e.g. TECNOLOGIA"
                      value={courseTag}
                      onChange={(e) => setCourseTag(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm uppercase font-mono"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-cat">
                      Categoria Geral *
                    </label>
                    <select
                      id="c-cat"
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-inst">
                      Instrutor Líder *
                    </label>
                    <input
                      id="c-inst"
                      type="text"
                      required
                      placeholder="Nome do Instrutor"
                      value={courseInstructorName}
                      onChange={(e) => setCourseInstructorName(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-inst-title">
                      Título Acadêmico
                    </label>
                    <input
                      id="c-inst-title"
                      type="text"
                      placeholder="Grau / Especialidade"
                      value={courseInstructorTitle}
                      onChange={(e) => setCourseInstructorTitle(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-lessons">
                      Número de Aulas *
                    </label>
                    <input
                      id="c-lessons"
                      type="number"
                      required
                      min={1}
                      value={courseLessonsCount}
                      onChange={(e) => setCourseLessonsCount(Math.max(1, Number(e.target.value)))}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] font-mono text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-price">
                      Preço de Inscrição (MT)
                    </label>
                    <input
                      id="c-price"
                      type="number"
                      min={0}
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(Math.max(0, Number(e.target.value)))}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-image">
                    Preencher Capa do Curso (URL da Imagem)
                  </label>
                  <input
                    id="c-image"
                    type="url"
                    placeholder="https://..."
                    value={courseImageUrl}
                    onChange={(e) => setCourseImageUrl(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                  <div className="mt-2 text-xs flex flex-wrap gap-1.5" id="c-presets">
                    <span className="text-slate-400 font-mono text-[9px] uppercase self-center">Presets de Capas:</span>
                    {coverImagePresets.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCourseImageUrl(pr.url)}
                        className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm border border-transparent cursor-pointer"
                      >
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-skills">
                    Competências Ensinadas (separadas por vírgula)
                  </label>
                  <input
                    id="c-skills"
                    type="text"
                    placeholder="Algoritmos, Logica Reativa, APIs REST"
                    value={courseSkillsCsv}
                    onChange={(e) => setCourseSkillsCsv(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="c-desc">
                    Descrição Curricular *
                  </label>
                  <textarea
                    id="c-desc"
                    required
                    rows={3}
                    placeholder="Abordagem prática do curso..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCourseReset}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                  >
                    Limpar Formulário
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer"
                  >
                    {editingCourseId ? "Gravar Edição" : "+ Publicar Curso"}
                  </button>
                </div>
              </form>
            </div>

            {/* Courses listing right-block */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-display font-semibold text-base text-[#0a2540]">
                  Cursos Cadastrados ({courses.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider">
                      <th className="pb-3 px-2">Capa</th>
                      <th className="pb-3 px-2">Identificação / Detalhes</th>
                      <th className="pb-3 px-2">Aulas</th>
                      <th className="pb-3 px-2 text-right">Preço</th>
                      <th className="pb-3 px-2 text-center">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map(course => (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2">
                          <img src={course.image} alt="" className="w-12 aspect-video object-cover rounded-sm border border-slate-200" />
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0a2540]">{course.title}</span>
                            <span className="text-[10px] text-[#0d9488] font-mono mt-0.5 uppercase tracking-wide">
                              {course.tag} // {course.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-500">
                          {course.lessonsCount}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-slate-700 font-semibold">
                          {course.price === 0 ? "Grátis" : `${course.price.toLocaleString("pt-PT")} MT`}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleCourseEditStart(course)}
                              className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                              title="Editar Curso"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Confirma a exclusão irrevogável do curso "${course.title}"?`)) {
                                  onDeleteCourse(course.id);
                                  triggerAlert("success", "O curso selecionado foi deletado.");
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                              title="Remover Curso"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIA MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-categories">
            {/* Form list creation left col */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                Adicionar Nova Categoria
              </h3>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="cat-name">
                    Nome da Categoria de Ensino *
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    placeholder="e.g. Design de Interfaces"
                    value={numCategoryName}
                    onChange={(e) => setNumCategoryName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="cat-icon">
                    Ícone Representativo (Lucide-react)
                  </label>
                  <select
                    id="cat-icon"
                    value={numCategoryIcon}
                    onChange={(e) => setNumCategoryIcon(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                  >
                    <option value="Code">Código (Code)</option>
                    <option value="Binary">Código Binário (Binary)</option>
                    <option value="Beaker">Laboratório (Beaker)</option>
                    <option value="TrendingUp">Gráfico Comercial (TrendingUp)</option>
                    <option value="Lightbulb">Lâmpada Criativa (Lightbulb)</option>
                    <option value="Mail">E-mail (Mail)</option>
                    <option value="Compass">Bússola (Compass)</option>
                    <option value="Cpu">Processador (Cpu)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer"
                >
                  Confirmar Categoria
                </button>
              </form>
            </div>

            {/* List current categories */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                Categorias Acadêmicas Ativas ({categories.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider">
                      <th className="pb-3 px-2">Identificador ID</th>
                      <th className="pb-3 px-2">Nome Visível</th>
                      <th className="pb-3 px-2">Ícone Selecionado</th>
                      <th className="pb-3 px-2 text-center">Operações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-mono text-slate-500">{cat.id}</td>
                        <td className="py-2.5 px-2 font-bold text-[#0a2540]">{cat.name}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-400">{cat.iconName}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                if (confirm(`Deletar a categoria "${cat.name}"? Cursos sob esta categoria não serão excluídos, mas seu canal de filtro será desconectado.`)) {
                                  onDeleteCategory(cat.id);
                                  triggerAlert("success", "Categoria deletada da CursaQi.");
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                              title="Remover Categoria"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEOS MANAGEMENT */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-videos">
            {/* Form attach video */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                Anexar Aula em Vídeo aos Cursos
              </h3>

              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="v-course">
                    Selecionar o Curso Associado *
                  </label>
                  <select
                    id="v-course"
                    value={videoCourseId}
                    onChange={(e) => setVideoCourseId(e.target.value)}
                    required
                    className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                  >
                    <option value="">-- Escolher Programa --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="v-title">
                    Título do Vídeo / Aula *
                  </label>
                  <input
                    id="v-title"
                    type="text"
                    required
                    placeholder="e.g. Aula 1. Setup Ambiental Completo"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="v-url">
                      URL do Vídeo (cole qualquer link da Wistia) *
                    </label>
                    <input
                      id="v-url"
                      type="text"
                      required
                      placeholder="Cole aqui qualquer link da Wistia"
                      value={videoUrl}
                      onChange={(e)=>handleVideoUrlChange(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                    />
                  </div>

                  <div className="mt-2">
                      {videoUrl.length > 0 && (
                          videoValid ? (
                            <span className="text-emerald-600 text-xs font-semibold">
                                ✓ Link da Wistia válido
                              </span>
                          ) : (
                              <span className="text-red-600 text-xs font-semibold">
                                Link inválido
                              </span>
                            )
                      )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="v-dur">
                      Duração (Min:Seg)
                    </label>
                    
                    <input
                      id="v-dur"
                      type="text"
                      placeholder="e.g. 15:40"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                    />
                  </div>
                </div>
                {videoValid && (
                      <div className="border rounded-sm overflow-hidden mt-5">
                          <div className="bg-slate-100 px-3 py-2 text-xs font-semibold">
                              Pré-visualização do vídeo
                          </div>
                          <iframe
                              src={`https://fast.wistia.net/embed/iframe/${videoPreviewId}`}
                              className="w-full aspect-video"
                              allow="autoplay; fullscreen"
                              allowFullScreen
                          />
                      </div>
                      )}
                <div className="flex items-center gap-3 pt-2">
                  {editingVideoId && (
                    <button
                      type="button"
                      onClick={handleVideoReset}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer"
                  >
                    {editingVideoId ? "Gravar Edição" : "Salvar Nova Aula"}
                  </button>
                </div>
              </form>
            </div>

            {/* List attached videos - GROUPED BY COURSE */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-[#0a2540]">
                    Grade de Aulas por Curso ({videos.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Vídeos organizados individualmente por cada curso para que não se misturem.
                  </p>
                </div>

                {/* Filter and Search controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pesquisar aula..."
                      value={videoSearchQuery}
                      onChange={(e) => setVideoSearchQuery(e.target.value)}
                      className="pl-7 pr-3 py-1.5 border border-slate-200 rounded-sm text-xs focus:outline-[#0d9488]"
                    />
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>

                  <select
                    value={selectedCourseVideoFilter}
                    onChange={(e) => setSelectedCourseVideoFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-sm text-xs font-semibold focus:outline-[#0d9488]"
                  >
                    <option value="ALL">Todos os Cursos ({courses.length})</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grouped Course Sections */}
              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {courses
                  .filter(c => selectedCourseVideoFilter === "ALL" || c.id === selectedCourseVideoFilter)
                  .map(course => {
                    const courseVideos = videos.filter(v => 
                      v.courseId === course.id && 
                      (!videoSearchQuery.trim() || v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()))
                    );

                    return (
                      <div 
                        key={course.id}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                      >
                        {/* Course Group Header */}
                        <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-[#0a2540] truncate" title={course.title}>
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span className="text-slate-600 font-normal">
                                {course.tag}
                              </span>
                              <span>Formador: {course.instructorName}</span>
                              <span>• {courseVideos.length} aula{courseVideos.length !== 1 ? "s" : ""}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setVideoCourseId(course.id);
                              const form = document.getElementById("v-title");
                              if (form) form.focus();
                            }}
                            className="inline-flex items-center gap-1 text-[11px] bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Adicionar aula diretamente neste curso"
                          >
                            <span>Adicionar</span>
                          </button>
                        </div>

                        {/* Videos Table for this specific course */}
                        {courseVideos.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs italic">
                            Nenhuma aula cadastrada para este curso ainda. Use o botão acima para adicionar.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase tracking-wider bg-slate-50/50">
                                  <th className="py-2 px-3 w-10">#</th>
                                  <th className="py-2 px-3">Título da Aula</th>
                                  <th className="py-2 px-3 font-mono">Duração</th>
                                  <th className="py-2 px-3 font-mono">ID Wistia</th>
                                  <th className="py-2 px-3 text-center">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {courseVideos.map((vid, idx) => (
                                  <tr key={vid.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-800">{vid.title}</td>
                                    <td className="py-2.5 px-3 font-mono text-slate-500">{vid.duration}</td>
                                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px] truncate max-w-[90px]">{vid.videoUrl}</td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => handleVideoEditStart(vid)}
                                          className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                                          title="Editar Aula"
                                        >
                                          <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Remover permanentemente a aula: "${vid.title}" deste curso?`)) {
                                              onDeleteVideo(vid.id);
                                              triggerAlert("success", "Aula removida com sucesso.");
                                            }
                                          }}
                                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                          title="Anular Vídeo"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {courses.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum curso cadastrado ainda. Cadastre um curso primeiro para poder adicionar aulas.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUIZZES & EXAMES */}
        {activeTab === "quizzes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-quizzes">
            {/* Left: Form editor for Quizzes & Exam Questions */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                {editingQuizId ? "Editar Pergunta" : "Adicionar Nova Pergunta"}
              </h3>

              <form onSubmit={handleQuizSubmit} className="space-y-4" id="quiz-form">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="qz-course">
                    Curso Pertencente *
                  </label>
                  <select
                    id="qz-course"
                    required
                    value={quizCourseId || courses[0]?.id || ""}
                    onChange={(e) => setQuizCourseId(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tipo de Pergunta *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizType("quiz")}
                      className={`px-3 py-2 text-xs font-semibold rounded-xs border transition-all text-left flex items-center gap-2 cursor-pointer ${
                        quizType === "quiz"
                          ? "bg-teal-50 border-[#0d9488] text-[#0d9488]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${quizType === "quiz" ? "bg-[#0d9488]" : "bg-slate-300"}`} />
                      <div>
                        <div className="font-bold">Quiz de Aula</div>
                        <div className="text-[10px] text-slate-400 font-normal">Consolidação</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizType("exam")}
                      className={`px-3 py-2 text-xs font-semibold rounded-xs border transition-all text-left flex items-center gap-2 cursor-pointer ${
                        quizType === "exam"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${quizType === "exam" ? "bg-indigo-600" : "bg-slate-300"}`} />
                      <div>
                        <div className="font-bold">Exame Final</div>
                        <div className="text-[10px] text-slate-400 font-normal">P/ Certificado</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="qz-question">
                    Enunciado da Pergunta *
                  </label>
                  <textarea
                    id="qz-question"
                    required
                    rows={3}
                    placeholder={quizType === "exam" ? "e.g. Pergunta referente à avaliação final do curso..." : "e.g. Qual é a finalidade do método React.useEffect?"}
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm resize-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Alternativas de Resposta (Selecione a Correta):
                  </span>

                  <div className="space-y-2">
                    {/* Option A */}
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-opt"
                        checked={quizCorrectIndex === 0}
                        onChange={() => setQuizCorrectIndex(0)}
                        className="h-4 w-4 text-[#0d9488] focus:ring-[#0d9488] cursor-pointer"
                        title="Marcar como alternativa correta"
                      />
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">A:</span>
                      <input
                        type="text"
                        required
                        placeholder="Opção A *"
                        value={quizOptionA}
                        onChange={(e) => setQuizOptionA(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-[#0d9488] text-xs"
                      />
                    </div>

                    {/* Option B */}
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-opt"
                        checked={quizCorrectIndex === 1}
                        onChange={() => setQuizCorrectIndex(1)}
                        className="h-4 w-4 text-[#0d9488] focus:ring-[#0d9488] cursor-pointer"
                        title="Marcar como alternativa correta"
                      />
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">B:</span>
                      <input
                        type="text"
                        required
                        placeholder="Opção B *"
                        value={quizOptionB}
                        onChange={(e) => setQuizOptionB(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-[#0d9488] text-xs"
                      />
                    </div>

                    {/* Option C */}
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-opt"
                        checked={quizCorrectIndex === 2}
                        onChange={() => setQuizCorrectIndex(2)}
                        className="h-4 w-4 text-[#0d9488] focus:ring-[#0d9488] cursor-pointer"
                        title="Marcar como alternativa correta"
                      />
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">C:</span>
                      <input
                        type="text"
                        placeholder="Opção C (Opcional)"
                        value={quizOptionC}
                        onChange={(e) => setQuizOptionC(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-[#0d9488] text-xs"
                      />
                    </div>

                    {/* Option D */}
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-opt"
                        checked={quizCorrectIndex === 3}
                        onChange={() => setQuizCorrectIndex(3)}
                        className="h-4 w-4 text-[#0d9488] focus:ring-[#0d9488] cursor-pointer"
                        title="Marcar como alternativa correta"
                      />
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">D:</span>
                      <input
                        type="text"
                        placeholder="Opção D (Opcional)"
                        value={quizOptionD}
                        onChange={(e) => setQuizOptionD(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-[#0d9488] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleQuizReset}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                  >
                    Limpar / Resetar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      quizType === "exam" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-[#0d9488] hover:bg-[#0f766e]"
                    }`}
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{editingQuizId ? "Salvar Pergunta" : quizType === "exam" ? "Cadastrar p/ Exame" : "Cadastrar p/ Quiz"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Table of registered quizzes & exam questions */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                <h3 className="font-display font-semibold text-base text-[#0a2540]">
                  Perguntas e Exames ({quizzes.length})
                </h3>

                <div className="flex items-center gap-2">
                  <select
                    value={quizFilterType}
                    onChange={(e) => setQuizFilterType(e.target.value as "ALL" | "quiz" | "exam")}
                    className="px-2.5 py-1 border border-slate-200 bg-slate-50 text-xs font-mono rounded-xs focus:outline-[#0d9488]"
                  >
                    <option value="ALL">Todos os Tipos ({quizzes.length})</option>
                    <option value="quiz">Quizzes de Aula ({quizzes.filter(q => q.type !== "exam").length})</option>
                    <option value="exam">Perguntas de Exame ({quizzes.filter(q => q.type === "exam").length})</option>
                  </select>

                  <select
                    value={quizFilterCourseId}
                    onChange={(e) => setQuizFilterCourseId(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 bg-slate-50 text-xs font-mono rounded-xs focus:outline-[#0d9488]"
                  >
                    <option value="ALL">Todos os Cursos ({quizzes.length})</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({quizzes.filter(q => q.courseId === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-sm">
                  Nenhuma pergunta cadastrada. Preencha o formulário ao lado para adicionar quizzes de aula ou perguntas para o exame final dos cursos.
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {quizzes
                    .filter(q => (quizFilterCourseId === "ALL" || q.courseId === quizFilterCourseId) && (quizFilterType === "ALL" || (quizFilterType === "exam" ? q.type === "exam" : q.type !== "exam")))
                    .map((q, qIndex) => {
                      const courseMatch = courses.find(c => c.id === q.courseId);
                      const isExam = q.type === "exam";
                      return (
                        <div
                          key={q.id}
                          className={`border rounded-sm p-4 text-left space-y-2.5 hover:border-slate-350 transition-colors ${
                            isExam ? "bg-indigo-50/30 border-indigo-200" : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isExam ? (
                                  <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                    🎓 EXAME FINAL
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono font-bold bg-[#0d9488]/10 text-[#0d9488] px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                    📝 QUIZ DE AULA
                                  </span>
                                )}
                                <span className="text-[9px] font-mono font-semibold text-slate-500">
                                  {courseMatch?.title || `Curso ID: ${q.courseId}`}
                                </span>
                              </div>
                              <h4 className="font-sans font-bold text-xs text-[#0a2540] mt-1.5 leading-snug">
                                #{qIndex + 1}. {q.question}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleQuizEditStart(q)}
                                className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                                title="Editar Pergunta"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remover a pergunta "${q.question}"?`)) {
                                    onDeleteQuiz(q.id);
                                    if (editingQuizId === q.id) handleQuizReset();
                                    triggerAlert("success", "Pergunta do quiz excluída com sucesso.");
                                  }
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                title="Excluir Pergunta"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === q.correctIndex;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-xs border text-[11px] flex items-center justify-between ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                      : "bg-white border-slate-200 text-slate-600"
                                  }`}
                                >
                                  <span className="truncate">
                                    <strong className="font-mono mr-1">{String.fromCharCode(65 + oIdx)}:</strong> {opt}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-1" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MATERIAIS DIDÁTICOS (PDF) */}
        {activeTab === "materials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-materials">
            {/* Left: Form editor for Materials */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                {editingMaterialId ? "Editar Material Didático" : "Adicionar Material Didático (PDF)"}
              </h3>

              <form onSubmit={handleMaterialSubmit} className="space-y-4" id="material-form">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="mat-course">
                    Curso Pertencente *
                  </label>
                  <select
                    id="mat-course"
                    required
                    value={materialCourseId || courses[0]?.id || ""}
                    onChange={(e) => setMaterialCourseId(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="mat-name">
                    Nome do Arquivo / Título do Material *
                  </label>
                  <input
                    id="mat-name"
                    type="text"
                    required
                    placeholder="e.g. Apostila_Capitulo_1_Introducao.pdf"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="mat-type">
                      Tipo de Ficheiro *
                    </label>
                    <select
                      id="mat-type"
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm uppercase font-mono"
                    >
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="doc">Documento Word (.docx)</option>
                      <option value="zip">Arquivo ZIP (.zip)</option>
                      <option value="outros">Outros Recursos</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="mat-size">
                      Tamanho Estimado *
                    </label>
                    <input
                      id="mat-size"
                      type="text"
                      required
                      placeholder="e.g. 2.4 MB"
                      value={materialSize}
                      onChange={(e) => setMaterialSize(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="mat-url">
                    Link / URL do PDF para Download *
                  </label>
                  <input
                    id="mat-url"
                    type="url"
                    required
                    placeholder="https://exemplo.com/documento.pdf"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                  />
                  <span className="text-[9.5px] text-slate-400 mt-1 font-sans">
                    Insira o link direto para o PDF ou selecione um modelo de teste abaixo:
                  </span>
                  
                  {/* Preset sample links */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {samplePdfPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMaterialUrl(preset.url)}
                        className="text-[9px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-xs border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleMaterialReset}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                  >
                    Limpar / Resetar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{editingMaterialId ? "Salvar Material" : "Cadastrar Material PDF"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Table of registered materials */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                <h3 className="font-display font-semibold text-base text-[#0a2540]">
                  Materiais Didáticos em PDF ({materials.length})
                </h3>

                <select
                  value={materialFilterCourseId}
                  onChange={(e) => setMaterialFilterCourseId(e.target.value)}
                  className="px-2.5 py-1 border border-slate-200 bg-slate-50 text-xs font-mono rounded-xs focus:outline-[#0d9488]"
                >
                  <option value="ALL">Todos os Cursos ({materials.length})</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({materials.filter(m => m.courseId === c.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {materials.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-sm">
                  Nenhum material didático em PDF cadastrado. Preencha o formulário ao lado para disponibilizar manuais aos estudantes.
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider">
                        <th className="pb-3 px-2">Material / Curso</th>
                        <th className="pb-3 px-2 font-mono">Tipo / Tamanho</th>
                        <th className="pb-3 px-2 text-center">Baixar / Ver</th>
                        <th className="pb-3 px-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materials
                        .filter(m => materialFilterCourseId === "ALL" || m.courseId === materialFilterCourseId)
                        .map(m => {
                          const courseMatch = courses.find(c => c.id === m.courseId);
                          return (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="h-4 w-4 text-[#0d9488] shrink-0" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[#0a2540] truncate max-w-[200px]" title={m.name}>
                                      {m.name}
                                    </span>
                                    <span className="font-mono text-[9px] text-slate-400 uppercase">
                                      {courseMatch?.title || `Curso ID: ${m.courseId}`}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 font-mono text-[10px] text-slate-500 uppercase">
                                {m.type} • {m.size}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 px-2 bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white border border-slate-200 rounded-xs transition-colors inline-flex items-center gap-1 text-[10px] font-mono"
                                  title="Abrir URL do Material"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Abrir</span>
                                </a>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleMaterialEditStart(m)}
                                    className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                                    title="Editar Material"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remover o material didático "${m.name}"?`)) {
                                        onDeleteMaterial(m.id);
                                        if (editingMaterialId === m.id) handleMaterialReset();
                                        triggerAlert("success", "Material didático removido com sucesso.");
                                      }
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                                    title="Excluir Material"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ADS / ANÚNCIOS MANAGEMENT */}
        {activeTab === "banners" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-ads">
            {/* Form configure ad */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h3 className="font-display font-semibold text-base text-[#0a2540]">
                  {editingBannerId ? "Editar Anúncio" : "Publicar Novo Anúncio"}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Os anúncios cadastrados aqui aparecem diretamente no card vertical de anúncios na Página Inicial.
                </p>
              </div>

              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="b-title">
                    Título do Anúncio *
                  </label>
                  <input
                    id="b-title"
                    type="text"
                    required
                    placeholder="e.g. Aprenda Informática e Programação do Zero"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="b-sub">
                    Subtítulo / Descrição do Anúncio (Opcional)
                  </label>
                  <textarea
                    id="b-sub"
                    rows={2}
                    placeholder="e.g. Atendimento personalizado e suporte direto com o Formador Aldo Valige no WhatsApp."
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="b-btn">
                    Texto do Botão de Ação
                  </label>
                  <input
                    id="b-btn"
                    type="text"
                    placeholder="e.g. Falar no WhatsApp ou Ver Curso"
                    value={bannerButtonText}
                    onChange={(e) => setBannerButtonText(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                  />
                </div>

                {/* Course Link Selector */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="b-course">
                    Curso Vinculado ao Anúncio (Opcional)
                  </label>
                  <select
                    id="b-course"
                    value={bannerCourseId}
                    onChange={(e) => setBannerCourseId(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm bg-white"
                  >
                    <option value="">— Sem curso vinculado —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.price === 0 ? "(Grátis)" : `(${c.price.toLocaleString("pt-PT")} MT)`}
                      </option>
                    ))}
                  </select>
                  {bannerCourseId && (
                    <p className="text-[10px] text-[#0d9488] mt-1 font-mono">
                      ✅ Ao clicar no botão, o aluno será levado para os detalhes desse curso.
                    </p>
                  )}
                </div>

                {/* External / Specific Page Link */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="b-link">
                    Link da Página / URL Externa (Opcional)
                  </label>
                  <input
                    id="b-link"
                    type="url"
                    placeholder="e.g. https://instagram.com/... ou https://wa.me/... ou https://seusite.com"
                    value={bannerLinkUrl}
                    onChange={(e) => setBannerLinkUrl(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Se preenchido, o botão do anúncio levará o usuário diretamente para esta página ou link externo ao clicar.
                  </p>
                </div>

                {/* Ad Image Uploader */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Imagem do Anúncio (Vertical / Instagram ou Quadrada) *
                  </label>
                  
                  {(bannerImageUrl || bannerImageFile) && (
                    <div className="mb-2 relative rounded border border-slate-200 overflow-hidden bg-slate-50 h-28 flex items-center justify-center">
                      <img 
                        src={bannerImageFile ? URL.createObjectURL(bannerImageFile) : bannerImageUrl} 
                        alt="Preview" 
                        className="h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerImageUrl("");
                          setBannerImageFile(null);
                        }}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md text-xs cursor-pointer flex items-center justify-center"
                        title="Remover Imagem"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="relative border-2 border-dashed border-slate-200 rounded-sm hover:border-[#0d9488] transition-colors p-4 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBannerImageFile(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 font-medium">
                      {bannerImageFile ? bannerImageFile.name : "Clique para selecionar a imagem do anúncio"}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      PNG, JPG, JPEG ou WEBP (formato vertical estilo Instagram recomendado)
                    </p>
                  </div>

                  <div className="mt-2">
                    <input
                      type="url"
                      placeholder="Ou cole a URL direta da imagem (https://...)"
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 text-xs font-mono rounded-xs focus:outline-[#0d9488]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 pb-1">
                  <input
                    id="b-active"
                    type="checkbox"
                    checked={bannerIsActive}
                    onChange={(e) => setBannerIsActive(e.target.checked)}
                    className="h-4 w-4 text-[#0d9488] border-slate-300 rounded"
                  />
                  <label htmlFor="b-active" className="text-xs font-semibold text-slate-600 select-none">
                    Anúncio Ativo e Visível no Card Lateral
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploadingBanner}
                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] disabled:bg-slate-400 text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {uploadingBanner && <Loader2 className="h-3 w-3 animate-spin" />}
                    {uploadingBanner ? "Salvando..." : (editingBannerId ? "Atualizar Anúncio" : "+ Publicar Anúncio")}
                  </button>

                  {editingBannerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerTitle("");
                        setBannerSubtitle("");
                        setBannerButtonText("");
                        setBannerIsActive(true);
                        setBannerImageUrl("");
                        setBannerImageFile(null);
                        setBannerCourseId("");
                        setBannerLinkUrl("");
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[10px] py-2.5 px-4 rounded-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List existing ads */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                Anúncios Cadastrados ({banners.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider">
                      <th className="pb-3 px-2">Título do Anúncio</th>
                      <th className="pb-3 px-2">Descrição</th>
                      <th className="pb-3 px-2">Estado</th>
                      <th className="pb-3 px-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {banners.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-bold text-[#0a2540]">
                          <div className="flex items-center gap-3">
                            {b.imageUrl ? (
                              <img 
                                src={b.imageUrl} 
                                alt={b.title} 
                                className="w-10 h-12 object-cover rounded-sm border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-12 bg-slate-100 flex items-center justify-center rounded-sm text-[10px] text-slate-400 font-mono">
                                Sem img
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="truncate max-w-[140px]" title={b.title}>{b.title}</span>
                              {b.linkUrl && (
                                <span className="text-[9px] font-mono text-teal-600 truncate max-w-[140px]" title={b.linkUrl}>
                                  🔗 {b.linkUrl}
                                </span>
                              )}
                              {b.courseId && (
                                <span className="text-[9px] font-mono text-indigo-600 truncate max-w-[140px]">
                                  📚 Curso vinculado
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 max-w-sm truncate text-slate-500" title={b.subtitle}>
                          {b.subtitle}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] uppercase tracking-wide ${
                            b.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {b.isActive ? "Visível" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingBannerId(b.id);
                                setBannerTitle(b.title);
                                setBannerSubtitle(b.subtitle);
                                setBannerButtonText(b.buttonText);
                                setBannerIsActive(b.isActive);
                                setBannerImageUrl(b.imageUrl || "");
                                setBannerImageFile(null);
                                setBannerCourseId(b.courseId || "");
                                setBannerLinkUrl(b.linkUrl || "");
                              }}
                              className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                              title="Editar Anúncio"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Deseja mesmo remover o anúncio: "${b.title}"?`)) {
                                  await onDeleteBanner(b.id);
                                  triggerAlert("success", "Anúncio deletado com sucesso.");
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                              title="Remover Anúncio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDENTS MANAGEMENT (MODERAÇÃO DE ALUNOS COM EDIÇÃO LIVRE) */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left" id="panel-admin-students">
            {/* Left Col: Edição livre de qualquer conta de estudante */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                {editingUserId ? "Edição Livre de Usuário (Admin Controle)" : "Selecione um Usuário Abaixo para Editar"}
              </h3>

              {editingUserId ? (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="stu-email">
                      E-mail Acadêmico (Editável por Admin)
                    </label>
                    <input
                      id="stu-email"
                      type="email"
                      required
                      placeholder="aluno@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="stu-name">
                      Nome Completo *
                    </label>
                    <input
                      id="stu-name"
                      type="text"
                      required
                      placeholder="Nome do Aluno"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="stu-whats">
                      Contacto de WhatsApp *
                    </label>
                    <input
                      id="stu-whats"
                      type="text"
                      required
                      placeholder="+244"
                      value={userWhatsapp}
                      onChange={(e) => setUserWhatsapp(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="stu-address">
                      Morada / Localidade *
                    </label>
                    <input
                      id="stu-address"
                      type="text"
                      required
                      placeholder="Endereço físico"
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-sm"
                    />
                  </div>



                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="stu-role">
                      Função na Plataforma
                    </label>
                    <select
                      id="stu-role"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as "admin" | "user")}
                      className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-sm"
                    >
                      <option value="user">Usuário Comum / Estudante</option>
                      <option value="admin">Administrador do Sistema</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStudentReset}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer"
                    >
                      Salvar Alterações Livres
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-sm">
                  Selecione qualquer estudante na lista lateral clicando em seu botão de Edição Livre de Perfil para modificar qualquer um de seus dados cadastrados sem bloqueio.
                </div>
              )}
            </div>

            {/* Right Col: Registered students lists */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs" style={{ padding: "32px" }}>
              <h3 className="font-display font-semibold text-base text-[#0a2540] border-b border-slate-100 pb-2 mb-4">
                Estudantes e Usuários Registrados ({users.length})
              </h3>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider">
                      <th className="pb-3 px-2">Usuário / Email</th>
                      <th className="pb-3 px-2 font-mono">Whatsapp</th>
                      <th className="pb-3 px-2">Morada</th>
                      <th className="pb-3 px-2">Cargo</th>
                      <th className="pb-3 px-2 text-center">Edição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0a2540]">{u.fullName}</span>
                            <span className="font-mono text-[9px] text-slate-400 mt-0.5">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-500">{u.whatsapp}</td>
                        <td className="py-2.5 px-2 text-slate-600 truncate max-w-[120px]" title={u.address}>
                          {u.address}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase tracking-wide ${
                            u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-teal-50 text-teal-700"
                          }`}>
                            {u.role === "admin" ? "Admin" : "Usuário"}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStudentEditStart(u)}
                              className="p-1 text-[#0d9488] hover:bg-teal-50 rounded-xs transition-colors cursor-pointer"
                              title="Editar Perfil Livre"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (u.id === "admin-user") {
                                  alert("Este recurso administrativo master é protegido e não pode ser deletado.");
                                  return;
                                }
                                if (confirm(`Deletar irrevogavelmente o cadastro do estudante "${u.fullName}"?`)) {
                                  onDeleteUser(u.id);
                                  if (editingUserId === u.id) {
                                    handleStudentReset();
                                  }
                                  triggerAlert("success", "Estudante e credenciais removidos do sistema.");
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer"
                              title="Deletar Aluno"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "finance" && (
          <AdminFinanceView
            courses={courses}
            users={users}
            paymentMethods={paymentMethods}
            paymentTickets={paymentTickets}
            onUpdateTicketStatus={onUpdateTicketStatus}
            onSavePaymentMethod={onSavePaymentMethod}
            currentUser={currentUser}
          />
        )}

        {/* TAB 8: ATENDIMENTO & MENSAGENS DE SUPORTE */}
        {activeTab === "support" && (
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs text-left" style={{ padding: "32px" }} id="panel-admin-support">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-[#0d9488]" />
                  <h3 className="font-display font-semibold text-lg text-[#0a2540]">
                    Atendimento ao Estudante e Mensagens de Suporte ({supportMessages.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-sans mt-1">
                  Mensagens recebidas através do botão de suporte flutuante. Responda diretamente ao aluno para que apareça no suporte dele.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/258873308934"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Oficial</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Message List */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Histórico de Chamados de Suporte
                </h4>

                {supportMessages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <Headphones className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">Nenhuma mensagem de suporte registada de momento.</p>
                    <p className="text-[11px] text-slate-400">
                      Quando os utilizadores ou visitantes enviarem dúvidas através do botão de suporte flutuante, elas serão listadas aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {supportMessages.map((msg) => {
                      const isFormador = msg.authorRole === "formador";
                      const isAdmin = msg.authorRole === "admin";
                      const isReply = isFormador || isAdmin;

                      return (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isReply
                              ? "bg-teal-50/70 border-teal-200 ml-4"
                              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                isReply ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-700"
                              }`}>
                                {isReply ? <ShieldCheck className="h-3.5 w-3.5" /> : msg.authorName.slice(0, 1)}
                              </div>
                              <span className="font-bold text-xs text-slate-800">
                                {msg.authorName}
                              </span>
                              {isReply ? (
                                <span className="bg-teal-600 text-white text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs">
                                  Resposta do Admin
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs">
                                  {msg.authorRole}
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(msg.createdAt).toLocaleDateString("pt-PT")} • {new Date(msg.createdAt).toLocaleTimeString("pt-PT").slice(0, 5)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.message}
                          </p>

                          {!isReply && (
                            <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToMessageId(msg.id);
                                  setReplyText(`@${msg.authorName}: `);
                                }}
                                className="text-[11px] font-bold text-[#0d9488] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Responder a este estudante</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Responder no Canal de Suporte
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    A resposta será exibida em tempo real no widget de suporte do estudante.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Assinar Resposta como:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser.fullName} (Formador / Suporte Oficial)`}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-600 font-semibold rounded-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Mensagem de Resposta:
                    </label>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva a resposta para o estudante..."
                      className="px-3 py-2 bg-white border border-slate-200 focus:outline-[#0d9488] text-xs rounded-sm resize-none font-sans"
                    />
                  </div>

                  {/* Quick canned replies */}
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400">
                      Respostas Rápidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "A sua matrícula já foi confirmada com sucesso!",
                        "Por favor envie o comprovativo M-Pesa com referência legível.",
                        "O seu acesso aos vídeos e materiais didáticos foi liberado.",
                        "Qualquer dúvida adicional pode nos contactar via WhatsApp."
                      ].map((canned, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReplyText(prev => prev ? `${prev} ${canned}` : canned)}
                          className="text-[10px] bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 px-2 py-1 rounded-sm text-slate-600 transition-colors cursor-pointer text-left"
                        >
                          + {canned.slice(0, 32)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!replyText.trim() || isSendingReply}
                    onClick={() => handleSendSupportReply()}
                    className="w-full bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSendingReply ? "Enviando..." : "Enviar Resposta de Suporte"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info lock */}
        <div className="bg-slate-100 text-slate-400 font-mono text-[10px] text-center p-3 rounded-sm">
          CURSAQI CONTROL PANEL // PORTAL DE SEGURAÇA ATIVO COM CADASTRO E MATRÍCULA INTERNA COESIVA e LOCALSTORAGE.
        </div>

      </div>
    </div>
  );
}
