import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import CtaBanners from "./components/CtaBanners";
import CourseCard from "./components/CourseCard";
import BannerCarousel from "./components/BannerCarousel";
import CourseModal from "./components/CourseModal";
import AdminPanel from "./pages/admin/AdminPanel";
import AuthScreen from "./pages/AuthScreen";
import CertificateModal from "./components/CertificateModal";

// Modular Student Subviews Layout Components
import AboutView from "./pages/AboutView";
import CoursesCatalogView from "./pages/CoursesCatalogView";
import ProfileView from "./pages/ProfileView";
import HistoryView from "./pages/HistoryView";
import CertificatesView from "./pages/CertificatesView";
import CourseDetailView from "./pages/CourseDetailView";
import HomeDashboardView from "./pages/HomeDashboardView";
import UserPaymentsView from "./pages/UserPaymentsView";
import PurchaseModal from "./components/PurchaseModal";
import NotificationCenter, { MAPPED_ACTIONS } from "./components/NotificationCenter";
import ToastContainer from "./components/ToastContainer";
import ShareModal from "./components/ShareModal";
import AuthWallModal from "./components/AuthWallModal";
import LiveChatWidget from "./components/LiveChatWidget";
import { getFullShareUrl } from "./utils/shareUtils";
import { updateSEOTags, resetDefaultSEO } from "./utils/seo";
import {
  seedDatabaseIfEmpty,
  dbGetCategories,
  dbGetCourses,
  dbGetVideos,
  dbGetQuizzes,
  dbGetBanners,
  dbGetUsers,
  dbSaveUser,
  dbSaveCourse,
  dbDeleteCourse,
  dbSaveCategory,
  dbDeleteCategory,
  dbSaveVideo,
  dbDeleteVideo,
  dbSaveQuiz,
  dbDeleteQuiz,
  dbSaveBanner,
  dbDeleteBanner,
  dbDeleteUser,
  dbGetNotifications,
  dbSaveNotification,
  dbMarkAllNotificationsRead,
  dbClearNotifications,
  dbGetSingleUserProfile,
  supabase,
  dbGetCourseEnrollmentCount,
  dbGetMaterials,
  dbGetAllMaterials,
  dbSaveMaterial,
  dbDeleteMaterial,
  dbSaveExamAttempt,
  dbGetPaymentMethods,
  dbGetPaymentTickets,
  dbUpdateTicketStatus,
  dbSavePaymentMethod,
  dbCheckAndExpirePremium
} from "./supabase";
import { initialCourses, initialCategories, initialVideos, initialQuizzes, initialMaterials, initialBanners, initialUsers } from "./data";
import { Course, Category, CourseVideo, Quiz, PromoBanner, UserProfile, UserProgress, PlatformNotification, DidacticMaterial, PaymentMethod, PaymentTicket, PREMIUM_SUBSCRIPTION_ID, PREMIUM_SUBSCRIPTION_PRICE, PREMIUM_SUBSCRIPTION_DAYS } from "./types";
import { ArrowUpRight, GraduationCap, Sparkles, Megaphone, User, Lock, Award, ShieldAlert, CheckCircle2, X, Mail, MessageCircle } from "lucide-react";

export default function App() {
  // Core data banks
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allMaterials, setAllMaterials] = useState<DidacticMaterial[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTickets, setPaymentTickets] = useState<PaymentTicket[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseCourse, setPurchaseCourse] = useState<Course | null>(null);

  // User session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active view constraints
  // "home" | "admin" | "auth" | "courses" | "about" | "history" | "certificates" | "profile"
  const [currentView, setCurrentView] = useState<string>("home");
  const [authScreenMode, setAuthScreenMode] = useState<"login" | "register">("login");
  const [isStudying, setIsStudying] = useState<boolean>(false);
  const [initialVideoId, setInitialVideoId] = useState<string | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<DidacticMaterial[]>([]);

  // Selection filtering criteria
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Active Certificate state to display certificate overlays
  const [activeCertificate, setActiveCertificate] = useState<{
    course: Course;
    examScore: number;
    examDate: string;
    certificateId: string;
  } | null>(null);

  // Cookie preference consent state
  const [cookiePreference, setCookiePreference] = useState<string | null>(null);

  // Social Share states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
  }>({
    title: "CUrsaQi",
    url: typeof window !== "undefined" ? window.location.origin : "https://cursaqi.com"
  });

  // Auth Wall state (mandatory account creation to view contents)
  const [isAuthWallOpen, setIsAuthWallOpen] = useState(false);
  const [pendingCourseForAuth, setPendingCourseForAuth] = useState<Course | null>(null);



  // Platform notifications state
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [activeToasts, setActiveToasts] = useState<PlatformNotification[]>([]);

  // Helper trigger for all 17 custom illustrated action events
  const triggerPlatformNotification = (type: string, title?: string, message?: string) => {
    const actionMatch = MAPPED_ACTIONS.find(a => a.id === type);
    if (!actionMatch) return;

    const newN: PlatformNotification = {
      id: "notification-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      type: type,
      title: title || actionMatch.defaultTitle,
      message: message || actionMatch.defaultMessage,
      imageUrl: actionMatch.imageUrl,
      timestamp: new Date().toLocaleTimeString("pt-PT").slice(0, 5) + " • " + new Date().toLocaleDateString("pt-PT"),
      read: false
    };

    setNotifications(prev => {
      const updated = [newN, ...prev];
      localStorage.setItem("cursaqi_notifications", JSON.stringify(updated));
      return updated;
    });

    if (currentUser) {
      dbSaveNotification(newN, currentUser.email).catch(err => {
        console.error("Error saving notification to DB:", err);
      });
    }

    // Spawn animated toast alert
    setActiveToasts(prev => [...prev, newN]);
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("cursaqi_notifications");
    if (currentUser) {
      dbClearNotifications(currentUser.email).catch(err => {
        console.error("Error clearing notifications from DB:", err);
      });
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("cursaqi_notifications", JSON.stringify(updated));
      return updated;
    });
    if (currentUser) {
      dbMarkAllNotificationsRead(currentUser.email).catch(err => {
        console.error("Error marking all read in DB:", err);
      });
    }
  };

  // --- AUTO SCROLL UP ON ROUTING/VIEW SHIFTS ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedCourse?.id, activeCertificate?.certificateId, isStudying]);

  // Fetch didactic materials dynamically when course is selected or allMaterials state changes
  useEffect(() => {
    async function fetchMaterials() {
      if (selectedCourse) {
        const mats = await dbGetMaterials(selectedCourse.id);
        if (mats && mats.length > 0) {
          setCourseMaterials(mats);
        } else {
          // Fallback to in-memory allMaterials list
          setCourseMaterials(allMaterials.filter(m => m.courseId === selectedCourse.id));
        }
      } else {
        setCourseMaterials([]);
      }
    }
    fetchMaterials();
  }, [selectedCourse?.id, allMaterials]);

  // Load all states on mounting from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        // Ensure DB has tables seeded if empty
        await seedDatabaseIfEmpty();

        // Fetch all values from Supabase DB (except users)
        const [dbCats, dbCourses, dbVids, dbQuizzes, dbBans, dbMethods, dbMats] = await Promise.all([
          dbGetCategories(),
          dbGetCourses(),
          dbGetVideos(),
          dbGetQuizzes(),
          dbGetBanners(),
          dbGetPaymentMethods().catch(() => []),
          dbGetAllMaterials().catch(() => [])
        ]);

        // Get real enrollment counts for each course securely
        const coursesWithRealCounts = dbCourses ? await Promise.all(
          dbCourses.map(async (course) => {
            const count = await dbGetCourseEnrollmentCount(course.id);
            return { ...course, enrolledStudentsCount: count };
          })
        ) : [];

        if (dbCats && dbCats.length > 0) {
          // Map categories and compute the course counts dynamically
          const countMap: Record<string, number> = {};
          coursesWithRealCounts.forEach((c) => {
            countMap[c.category] = (countMap[c.category] || 0) + 1;
          });
          const updatedCats = dbCats.map((cat) => ({
            ...cat,
            count: countMap[cat.id] || 0
          }));
          setCategories(updatedCats);
        } else {
          setCategories([]);
        }

        if (coursesWithRealCounts.length > 0) setCourses(coursesWithRealCounts);
        if (dbVids && dbVids.length > 0) setVideos(dbVids);
        if (dbQuizzes) setQuizzes(dbQuizzes);

        if (dbMats && dbMats.length > 0) {
          setAllMaterials(dbMats);
        } else {
          setAllMaterials(initialMaterials);
        }

        if (dbBans && dbBans.length > 0) setBanners(dbBans);
        if (dbMethods) setPaymentMethods(dbMethods);

        // Current active session synced with DB record
        const storedSession = localStorage.getItem("cursaqi_session_v2");
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            const freshUser = await dbGetSingleUserProfile(parsed.id);
            if (freshUser) {
              const checkedUser = await dbCheckAndExpirePremium(freshUser);
              setCurrentUser(checkedUser);
              localStorage.setItem("cursaqi_session_v2", JSON.stringify(checkedUser));
              
              // Load user tickets
              const userTkts = await dbGetPaymentTickets(checkedUser.id).catch(() => []);
              setPaymentTickets(userTkts);

              // Lazy-load other users if admin
              if (freshUser.role === "admin") {
                const [dbUsers, allTickets] = await Promise.all([
                  dbGetUsers(),
                  dbGetPaymentTickets().catch(() => [])
                ]);
                setAdminUsers(dbUsers);
                setPaymentTickets(allTickets);
              }
            } else {
              setCurrentUser(parsed);
            }
          } catch (e) {
            setCurrentUser(null);
          }
        }

        // Check deep-linking query parameters (?course=... or ?view=...)
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const courseParam = urlParams.get("course");
          const viewParam = urlParams.get("view");

          if (courseParam) {
            const matchedCourse = coursesWithRealCounts.find(c => c.id === courseParam);
            if (matchedCourse) {
              if (storedSession) {
                setSelectedCourse(matchedCourse);
                updateSEOTags({
                  title: matchedCourse.title,
                  description: matchedCourse.description,
                  imageUrl: matchedCourse.image,
                  url: getFullShareUrl(matchedCourse.id)
                });
              } else {
                // Unauthenticated visitor arrived via shared course link: trigger auth-wall!
                setPendingCourseForAuth(matchedCourse);
                try {
                  sessionStorage.setItem("cursaqi_pending_course_id", matchedCourse.id);
                } catch (e) {}
                setIsAuthWallOpen(true);
              }
            }
          } else if (viewParam && ["courses", "about"].includes(viewParam)) {
            setCurrentView(viewParam);
          }
        }
      } catch (err) {
        console.error("Error loading data from Supabase, falling back to local defaults:", err);
      }
    }

    loadData();

    // Cookie Preference Lookups
    const storedCookiePref = localStorage.getItem("cursaqi_cookie_consent");
    if (storedCookiePref) {
      setCookiePreference(storedCookiePref);
    }

    // Load notifications from local storage or populate with initial com_energia
    const storedNotifications = localStorage.getItem("cursaqi_notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      // Create initial com_energia welcoming notification
      const initialNotice: PlatformNotification = {
        id: "notify-initial-energy",
        type: "com_energia",
        title: "Conexão Ativada com Sucesso!",
        message: "Ficamos muito felizes de ter você de volta estudando hoje. Aproveite a energia alta para concluir as metas pendentes!",
        imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/com_energia.png",
        timestamp: new Date().toLocaleTimeString("pt-PT").slice(0, 5) + " • " + new Date().toLocaleDateString("pt-PT"),
        read: false
      };
      setNotifications([initialNotice]);
      localStorage.setItem("cursaqi_notifications", JSON.stringify([initialNotice]));
    }
  }, []);

  // Sync notifications with Supabase DB on user change
  useEffect(() => {
    async function syncDbNotifications() {
      if (currentUser) {
        try {
          const dbNotifs = await dbGetNotifications(currentUser.email);
          if (dbNotifs && dbNotifs.length > 0) {
            setNotifications(dbNotifs);
            localStorage.setItem("cursaqi_notifications", JSON.stringify(dbNotifs));
          } else {
            // Generate initial welcome notification for this student and save it to the DB
            const initialNotice: PlatformNotification = {
              id: "notify-welcome-" + currentUser.id,
              type: "com_energia",
              title: "Conexão Ativada com Sucesso!",
              message: "Ficamos muito felizes de ter você de volta estudando hoje. Aproveite a energia alta para concluir as metas pendentes!",
              imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/com_energia.png",
              timestamp: new Date().toLocaleTimeString("pt-PT").slice(0, 5) + " • " + new Date().toLocaleDateString("pt-PT"),
              read: false
            };
            setNotifications([initialNotice]);
            localStorage.setItem("cursaqi_notifications", JSON.stringify([initialNotice]));
            await dbSaveNotification(initialNotice, currentUser.email);
          }
        } catch (err) {
          console.error("Failed to load notifications from database:", err);
        }
      }
    }

    syncDbNotifications();
  }, [currentUser?.email]);

  // Cookie response handlers
  const handleAcceptCookies = () => {
    localStorage.setItem("cursaqi_cookie_consent", "accepted");
    setCookiePreference("accepted");
  };

  const handleDeclineCookies = () => {
    localStorage.setItem("cursaqi_cookie_consent", "declined");
    setCookiePreference("declined");
  };

  // Sync users to localStorage, Supabase and keep current session mirrored
  const syncCurrentUser = async (updatedMe: UserProfile) => {
    setCurrentUser(updatedMe);
    localStorage.setItem("cursaqi_session_v2", JSON.stringify(updatedMe));
    await dbSaveUser(updatedMe);
    
    // Sync with admin user management list if current logged in user is admin
    if (currentUser?.role === "admin") {
      setAdminUsers(prev => prev.map(u => u.id === updatedMe.id ? updatedMe : u));
    }
  };

  // Sync courses to storage and adjust counts
  const saveCoursesToStorage = (updatedList: Course[]) => {
    setCourses(updatedList);
    localStorage.setItem("cursaqi_courses_v2", JSON.stringify(updatedList));

    // Dynamic scale categories based on entries
    const countMap: Record<string, number> = {};
    updatedList.forEach((c) => {
      const catId = c.category;
      countMap[catId] = (countMap[catId] || 0) + 1;
    });

    const updatedCategories = categories.map((cat) => ({
      ...cat,
      count: countMap[cat.id] || 0,
    }));
    setCategories(updatedCategories);
  };

  // --- LOGOUT DISPATCH ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem("cursaqi_session_v2");
    setPaymentTickets([]);
    setSelectedCourse(null);
    setIsStudying(false);
    resetDefaultSEO();
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.pathname);
    }
    setCurrentView("home");
  };

  // --- LOGIN SUCCESS ---
  const handleLoginSuccess = async (user: UserProfile) => {
    const checkedUser = await dbCheckAndExpirePremium(user);
    setCurrentUser(checkedUser);
    localStorage.setItem("cursaqi_session_v2", JSON.stringify(checkedUser));

    // Re-fetch payment methods now that user is authenticated (RLS requires auth)
    const freshMethods = await dbGetPaymentMethods().catch(() => []);
    if (freshMethods.length > 0) setPaymentMethods(freshMethods);

    // Check if user was trying to access a course before logging in (Auth-Wall)
    let pendingId = pendingCourseForAuth?.id;
    if (!pendingId) {
      try {
        pendingId = sessionStorage.getItem("cursaqi_pending_course_id") || undefined;
      } catch (e) {}
    }
    const targetCourse = pendingId ? courses.find(c => c.id === pendingId) : null;

    if (targetCourse) {
      setSelectedCourse(targetCourse);
      setIsStudying(false);
      setPendingCourseForAuth(null);
      try {
        sessionStorage.removeItem("cursaqi_pending_course_id");
      } catch (e) {}
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `?course=${encodeURIComponent(targetCourse.id)}`);
      }
      updateSEOTags({
        title: targetCourse.title,
        description: targetCourse.description,
        imageUrl: targetCourse.image,
        url: getFullShareUrl(targetCourse.id)
      });
      const userTkts = await dbGetPaymentTickets(checkedUser.id).catch(() => []);
      setPaymentTickets(userTkts);
    } else if (checkedUser.role === "admin") {
      setCurrentView("admin");
      const [dbUsers, allTickets] = await Promise.all([
        dbGetUsers(),
        dbGetPaymentTickets().catch(() => [])
      ]);
      setAdminUsers(dbUsers);
      setPaymentTickets(allTickets);
    } else {
      setCurrentView("dashboard");
      const userTkts = await dbGetPaymentTickets(checkedUser.id).catch(() => []);
      setPaymentTickets(userTkts);
    }
    // Trigger "com_energia" welcoming notification on login
    triggerPlatformNotification("com_energia");
  };

  // --- REGISTER SUCCESS ---
  const handleRegisterSuccess = (newUser: UserProfile) => {
    if (currentUser?.role === "admin") {
      setAdminUsers(prev => [...prev, newUser]);
    }
    setPaymentTickets([]);
  };

  // --- SOCIAL SHARING TRIGGERS ---
  const handleShareSite = () => {
    setShareModalData({
      title: "CUrsaQi - Cursos Online de Informática com Aldo Valige",
      description: "Plataforma de cursos gratuitos e à venda na área de Informática, programação e redes criada pelo Formador Aldo Valige para quem quer aprender.",
      url: getFullShareUrl(),
      imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png"
    });
    setIsShareModalOpen(true);
  };

  const handleShareCourse = (course: Course) => {
    setShareModalData({
      title: `${course.title} | CUrsaQi`,
      description: `Confira o curso "${course.title}" com o formador ${course.instructorName} na plataforma CUrsaQi!`,
      url: getFullShareUrl(course.id),
      imageUrl: course.image
    });
    setIsShareModalOpen(true);
  };

  // --- COURSE OPENING WITH AUTH-WALL RESTRICTION ---
  // Requisito: "mas que utilizadores sem conta tenha que obrigatoriamente criar conta para ver os conteudos"
  const handleOpenCourse = (course: Course) => {
    if (!currentUser) {
      setPendingCourseForAuth(course);
      try {
        sessionStorage.setItem("cursaqi_pending_course_id", course.id);
      } catch (e) {}
      setIsAuthWallOpen(true);
      return;
    }

    setSelectedCourse(course);
    setIsStudying(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `?course=${encodeURIComponent(course.id)}`);
    }
    updateSEOTags({
      title: course.title,
      description: course.description,
      imageUrl: course.image,
      url: getFullShareUrl(course.id)
    });
  };

  const handleCloseCourse = () => {
    setSelectedCourse(null);
    setIsStudying(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.pathname);
    }
    resetDefaultSEO();
  };

  // Popstate hook to support browser forward and back buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const courseParam = urlParams.get("course");
      if (courseParam) {
        const found = courses.find(c => c.id === courseParam);
        if (found) {
          if (currentUser) {
            setSelectedCourse(found);
            setIsStudying(false);
          } else {
            setPendingCourseForAuth(found);
            setIsAuthWallOpen(true);
          }
          return;
        }
      }
      setSelectedCourse(null);
      setIsStudying(false);
      resetDefaultSEO();
      const viewParam = urlParams.get("view");
      if (viewParam) {
        setCurrentView(viewParam);
      } else {
        setCurrentView("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [courses, currentUser]);

  // --- MATRICULA FLOW ---
  const handleEnrollCourse = (courseId: string) => {
    if (!currentUser) return;

    // Check if already enrolled
    const exists = currentUser.enrolledCourseProgress?.some(p => p.courseId === courseId);
    if (exists) return;

    // Increment local state count for this course in real-time
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, enrolledStudentsCount: (c.enrolledStudentsCount || 0) + 1 };
      }
      return c;
    }));

    const newProgress: UserProgress = {
      courseId: courseId,
      progress: 0,
      currentLessonIndex: 0,
      completedQuizzes: [],
    };

    const updatedMe: UserProfile = {
      ...currentUser,
      enrolledCourseProgress: [...(currentUser.enrolledCourseProgress || []), newProgress],
    };

    syncCurrentUser(updatedMe);
    
    // Trigger "determinado" notification upon enrolling into a new module
    triggerPlatformNotification("determinado");

    // Force modal update state
    if (selectedCourse?.id === courseId) {
      setSelectedCourse({ ...selectedCourse });
    }
  };

  // --- ANSWER QUIZ & TRIGGER PROGRESS UPGRADE ---
  const handleSaveQuizResult = (courseId: string, quizId: string, isCorrect: boolean) => {
    if (!currentUser) return;

    // Find progress entry
    const entryIndex = currentUser.enrolledCourseProgress?.findIndex(p => p.courseId === courseId);
    if (entryIndex === -1 || entryIndex === undefined) return;

    const currentProgressList = [...currentUser.enrolledCourseProgress];
    const prevProgress = currentProgressList[entryIndex];

    // Read unique quiz array
    const alreadyAnswered = prevProgress.completedQuizzes?.includes(quizId);
    let updatedAnswers = prevProgress.completedQuizzes || [];

    if (isCorrect && !alreadyAnswered) {
      updatedAnswers = [...updatedAnswers, quizId];
    }

    // Calculate next progress percent.
    // Progress = (answered quizzes / total quizzes of course) * 100
    const courseQuizzesCount = quizzes.filter(q => q.courseId === courseId && q.type !== "exam").length || 1;
    const computedProgress = Math.min(100, Math.round((updatedAnswers.length / courseQuizzesCount) * 100));

    const updatedProgress: UserProgress = {
      ...prevProgress,
      completedQuizzes: updatedAnswers,
      progress: Math.max(prevProgress.progress, computedProgress), // keep highest score
    };

    currentProgressList[entryIndex] = updatedProgress;

    const updatedMe: UserProfile = {
      ...currentUser,
      enrolledCourseProgress: currentProgressList,
    };

    syncCurrentUser(updatedMe);

    // Trigger logical states "confiante" or "confuso" based on correctness
    if (isCorrect) {
      triggerPlatformNotification("confiante");
    } else {
      triggerPlatformNotification("confuso");
    }
  };

  // --- SAVE FINAL EXAM RESULT AND GENERATE CERTIFICATE ---
  const handleSaveExamResult = (courseId: string, score: number, date: string, certificateId: string) => {
    if (!currentUser) return;

    const entryIndex = currentUser.enrolledCourseProgress?.findIndex(p => p.courseId === courseId);
    if (entryIndex === -1 || entryIndex === undefined) return;

    const currentProgressList = [...currentUser.enrolledCourseProgress];
    const prevProgress = currentProgressList[entryIndex];

    const updatedProgress: UserProgress = {
      ...prevProgress,
      examScore: score,
      examDate: date,
      certificateId: score >= 80 ? certificateId : prevProgress.certificateId,
    };

    currentProgressList[entryIndex] = updatedProgress;

    const updatedMe: UserProfile = {
      ...currentUser,
      enrolledCourseProgress: currentProgressList,
    };

    syncCurrentUser(updatedMe);

    // Persist attempt to Supabase exam_attempts table
    dbSaveExamAttempt({
      id: crypto.randomUUID(),
      userId: currentUser.id,
      courseId,
      score,
      passed: score >= 80,
      certificateId: score >= 80 ? certificateId : undefined,
      attemptedAt: new Date().toISOString()
    }).catch((err) => console.warn("Could not record exam attempt in Supabase:", err));

    // Dynamic Platform notifications matching user status outcome
    if (score >= 80) {
      triggerPlatformNotification("orgulhoso");
    } else {
      triggerPlatformNotification("confuso");
    }

    // If modal is active and has corresponding details, refresh selectedCourse representation
    if (selectedCourse?.id === courseId) {
      setSelectedCourse({ ...selectedCourse });
    }
  };

  // --- FAVORITING (WISHLIST) COHESIVE WITH PROFILE OR GENERAL GUEST ---
  const handleToggleWishlist = (courseId: string) => {
    if (!currentUser) {
      // Non logged in user goes to login portal to prompt custom dashboard setup
      setCurrentView("auth");
      return;
    }

    const isFav = currentUser.favorites?.includes(courseId);
    let nextFavs = currentUser.favorites || [];

    if (isFav) {
      nextFavs = nextFavs.filter(id => id !== courseId);
    } else {
      nextFavs = [...nextFavs, courseId];
    }

    const updatedMe: UserProfile = { ...currentUser, favorites: nextFavs };
    syncCurrentUser(updatedMe);

    if (selectedCourse?.id === courseId) {
      setSelectedCourse({ ...selectedCourse });
    }
  };

  const handleSubscribePremium = () => {
    if (!currentUser) return;
    const mockPremiumCourse: Course = {
      id: PREMIUM_SUBSCRIPTION_ID,
      title: "Assinatura Estudantil Premium (90 dias)",
      category: "Assinatura",
      tag: "PREMIUM",
      lessonsCount: 0,
      price: PREMIUM_SUBSCRIPTION_PRICE,
      instructorName: "CUrsaQi",
      image: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/confiante.png",
      description: "Acesso total a todos os vídeos, cursos gratuitos e pagos, materiais didáticos e bónus extras por 90 dias.",
      enrolledStudentsCount: 0,
      rating: 5,
      skillsCovered: ["Todos os Cursos", "Todos os Materiais", "Bónus Extras"]
    };
    setPurchaseCourse(mockPremiumCourse);
    setIsPurchaseModalOpen(true);
  };

  // --- WATCH VIDEO TIMELINE LOGGER ---
  const handleWatchVideo = (courseId: string, videoId: string) => {
    if (!currentUser) return;
    const course = courses.find((c) => c.id === courseId);
    const video = videos.find((v) => v.id === videoId);
    if (!course || !video) return;

    // Check if duplicate watched
    const hasAlreadyWatched = currentUser.watchedVideos?.[videoId] !== undefined;
    if (hasAlreadyWatched) return;

    const trackEntry = {
      date: new Date().toLocaleDateString("pt-PT") + " " + new Date().toLocaleTimeString("pt-PT").slice(0, 5),
      videoTitle: video.title,
      courseTitle: course.title,
    };

    const updatedMe: UserProfile = {
      ...currentUser,
      watchedVideos: {
        ...(currentUser.watchedVideos || {}),
        [videoId]: trackEntry,
      },
    };

    syncCurrentUser(updatedMe);
  };

  // --- ADMIN CORE DIRECT ACTION MODS ---
  // Categories
  const handleAddCategory = async (newCat: Category) => {
    const nextCats = [...categories, newCat];
    await dbSaveCategory(newCat);
    setCategories(nextCats);
  };

  const handleDeleteCategory = async (catId: string) => {
    await dbDeleteCategory(catId);
    setCategories(categories.filter(c => c.id !== catId));
  };

  // Videos
  const handleAddVideo = async (newV: CourseVideo) => {
    const nextVids = [...videos, newV];
    await dbSaveVideo(newV);
    setVideos(nextVids);
    localStorage.setItem("cursaqi_videos_v2", JSON.stringify(nextVids));
  };

  const handleDeleteVideo = async (vId: string) => {
    const nextVids = videos.filter(v => v.id !== vId);
    await dbDeleteVideo(vId);
    setVideos(nextVids);
    localStorage.setItem("cursaqi_videos_v2", JSON.stringify(nextVids));
  };

  const handleUpdateVideo = async (updatedV: CourseVideo) => {
    const nextVids = videos.map(v => v.id === updatedV.id ? updatedV : v);
    await dbSaveVideo(updatedV);
    setVideos(nextVids);
    localStorage.setItem("cursaqi_videos_v2", JSON.stringify(nextVids));
  };

  // Quizzes CRUD
  const handleAddQuiz = async (newQ: Quiz) => {
    const nextQuizzes = [newQ, ...quizzes];
    await dbSaveQuiz(newQ);
    setQuizzes(nextQuizzes);
    localStorage.setItem("cursaqi_quizzes_v2", JSON.stringify(nextQuizzes));
  };

  const handleUpdateQuiz = async (updatedQ: Quiz) => {
    const nextQuizzes = quizzes.map(q => q.id === updatedQ.id ? updatedQ : q);
    await dbSaveQuiz(updatedQ);
    setQuizzes(nextQuizzes);
    localStorage.setItem("cursaqi_quizzes_v2", JSON.stringify(nextQuizzes));
  };

  const handleDeleteQuiz = async (qId: string) => {
    const nextQuizzes = quizzes.filter(q => q.id !== qId);
    await dbDeleteQuiz(qId);
    setQuizzes(nextQuizzes);
    localStorage.setItem("cursaqi_quizzes_v2", JSON.stringify(nextQuizzes));
  };

  // Didactic Materials CRUD
  const handleAddMaterial = async (newM: DidacticMaterial) => {
    const nextMats = [newM, ...allMaterials];
    await dbSaveMaterial(newM);
    setAllMaterials(nextMats);
    localStorage.setItem("cursaqi_materials_v2", JSON.stringify(nextMats));
  };

  const handleUpdateMaterial = async (updatedM: DidacticMaterial) => {
    const nextMats = allMaterials.map(m => m.id === updatedM.id ? updatedM : m);
    await dbSaveMaterial(updatedM);
    setAllMaterials(nextMats);
    localStorage.setItem("cursaqi_materials_v2", JSON.stringify(nextMats));
  };

  const handleDeleteMaterial = async (mId: string) => {
    const nextMats = allMaterials.filter(m => m.id !== mId);
    await dbDeleteMaterial(mId);
    setAllMaterials(nextMats);
    localStorage.setItem("cursaqi_materials_v2", JSON.stringify(nextMats));
  };

  // Banners
  const handleAddBanner = async (newB: PromoBanner) => {
    const nextBans = [...banners, newB];
    await dbSaveBanner(newB);
    setBanners(nextBans);
    localStorage.setItem("cursaqi_banners_v2", JSON.stringify(nextBans));
  };

  const handleUpdateBanner = async (updatedB: PromoBanner) => {
    const nextBans = banners.map(b => b.id === updatedB.id ? updatedB : b);
    await dbSaveBanner(updatedB);
    setBanners(nextBans);
    localStorage.setItem("cursaqi_banners_v2", JSON.stringify(nextBans));
  };

  const handleDeleteBanner = async (bId: string) => {
    const nextBans = banners.filter(b => b.id !== bId);
    await dbDeleteBanner(bId);
    setBanners(nextBans);
    localStorage.setItem("cursaqi_banners_v2", JSON.stringify(nextBans));
  };

  // Student list moderators
  const handleUpdateUserProfile = async (updatedProfile: UserProfile) => {
    setAdminUsers(prev => prev.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    await dbSaveUser(updatedProfile);
    if (currentUser && updatedProfile.id === currentUser.id) {
      setCurrentUser(updatedProfile);
      localStorage.setItem("cursaqi_session_v2", JSON.stringify(updatedProfile));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setAdminUsers(prev => prev.filter(u => u.id !== userId));
    await dbDeleteUser(userId);
  };

  // --- TICKET UPDATE DISPATCH ---
  const handleUpdateTicketStatus = async (
    ticketId: string,
    status: "APPROVED" | "REJECTED" | "UNDER_REVIEW",
    adminNotes: string
  ) => {
    if (!currentUser) return;
    const success = await dbUpdateTicketStatus(ticketId, status, adminNotes, currentUser.id);
    if (success) {
      // Reload admin and user tickets
      const allTkts = await dbGetPaymentTickets().catch(() => []);
      setPaymentTickets(allTkts);
      
      // Sync fresh user data to reflect enrollment if approved
      const updatedTicket = allTkts.find(t => t.id === ticketId);
      if (updatedTicket && status === "APPROVED" && currentUser.id === updatedTicket.userId) {
        const freshUser = await dbGetSingleUserProfile(currentUser.id);
        if (freshUser) {
          syncCurrentUser(freshUser);
        }
      } else if (updatedTicket && status === "APPROVED") {
        // If it was another student, update their profile in the admin users list
        const freshStudent = await dbGetSingleUserProfile(updatedTicket.userId);
        if (freshStudent) {
          setAdminUsers(prev => prev.map(u => u.id === freshStudent.id ? freshStudent : u));
        }
      }
      
      // Update courses with new enrollment count
      const dbCourses = await dbGetCourses();
      const coursesWithRealCounts = dbCourses ? await Promise.all(
        dbCourses.map(async (course) => {
          const count = await dbGetCourseEnrollmentCount(course.id);
          return { ...course, enrolledStudentsCount: count };
        })
      ) : [];
      setCourses(coursesWithRealCounts);
      
      // Trigger platform notification to show toast
      triggerPlatformNotification("com_energia", "Estado de Ticket Atualizado", `O ticket foi marcado como ${status}.`);
    } else {
      alert("Não foi possível atualizar o ticket.");
    }
  };

  // --- SAVE PAYMENT METHOD DISPATCH ---
  const handleSavePaymentMethod = async (method: PaymentMethod) => {
    const success = await dbSavePaymentMethod(method);
    if (success) {
      const methods = await dbGetPaymentMethods();
      setPaymentMethods(methods);
      triggerPlatformNotification("com_energia", "Configurações Salvas", "Canal de pagamento salvo com sucesso.");
    } else {
      alert("Não foi possível salvar o método de pagamento.");
    }
  };

  // Standard filtering parameters
  const filteredCourses = courses.filter((c) => {
    if (selectedCategoryId && c.category !== selectedCategoryId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = c.title.toLowerCase().includes(q);
      const instructorMatch = c.instructorName.toLowerCase().includes(q);
      const tagMatch = c.tag.toLowerCase().includes(q);
      return titleMatch || instructorMatch || tagMatch;
    }
    return true;
  });

  const handleScrollToCourses = () => {
    const elt = document.getElementById("popular-courses-anchor");
    if (elt) {
      elt.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans selection:bg-[#0d9488]/20" id="cursaqi-react-root">
      
      {/* Universal Header with responsive switches */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          handleCloseCourse();
          setActiveCertificate(null);
          
          const requiresAuth = ["history", "certificates", "profile", "payments"].includes(view);
          if (requiresAuth && !currentUser) {
            setAuthScreenMode("login");
            setCurrentView("auth");
            return;
          }

          if (view === "admin") {
            if (currentUser && currentUser.role === "admin") {
              setCurrentView("admin");
            } else {
              setAuthScreenMode("login");
              setCurrentView("auth");
            }
          } else {
            setCurrentView(view);
            if (typeof window !== "undefined") {
              window.history.pushState(null, "", view === "home" ? window.location.pathname : `?view=${encodeURIComponent(view)}`);
            }
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setSelectedCourse(null);
          setActiveCertificate(null);
          setIsStudying(false);
          // Only redirect to courses page when there's an actual search query
          // Clearing the search (empty string) must NOT override the current view
          if (query.trim()) {
            setCurrentView("courses");
          }
        }}
        wishlistCount={currentUser?.favorites?.length || 0}
        userEmail={currentUser ? `${currentUser.fullName} (${currentUser.role === "admin" ? "Admin" : "Estudante"})` : undefined}
        isAdmin={currentUser?.role === "admin"}
        onLogout={handleLogout}
        onLoginClick={() => {
          handleCloseCourse();
          setActiveCertificate(null);
          setAuthScreenMode("login");
          setCurrentView("auth");
        }}
        onRegisterClick={() => {
          handleCloseCourse();
          setActiveCertificate(null);
          setAuthScreenMode("register");
          setCurrentView("auth");
        }}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        onNotificationToggle={() => setIsNotificationOpen(!isNotificationOpen)}
        onShareSite={handleShareSite}
      />

      {/* Notification drawer component with simulator */}
      <NotificationCenter
        notifications={notifications}
        onTriggerNotification={triggerPlatformNotification}
        onClearNotifications={handleClearNotifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Animated Toasts Container rendering */}
      <ToastContainer
        toasts={activeToasts}
        onDismissToast={handleDismissToast}
      />

      {/* Banner Carousel (Sliding Images) - Appears directly below the header/menu on all content pages */}
      {currentView !== "admin" && currentView !== "auth" && !isStudying && !activeCertificate && (
        <BannerCarousel
          banners={banners}
          courses={courses}
          onActionClick={handleScrollToCourses}
          onCourseClick={(course) => handleOpenCourse(course)}
        />
      )}

      {/* Primary Context Navigation view Switcher */}
      {activeCertificate ? (
        <main className="flex-1" id="main-certificate-viewer">
          <CertificateModal
            course={activeCertificate.course}
            user={currentUser!}
            examScore={activeCertificate.examScore}
            examDate={activeCertificate.examDate}
            certificateId={activeCertificate.certificateId}
            onClose={() => setActiveCertificate(null)}
          />
        </main>
      ) : isStudying && selectedCourse ? (
        <main className="flex-1" id="main-course-study-modal-overlay">
          <CourseModal
            course={selectedCourse}
            onClose={() => {
              setIsStudying(false);
              setInitialVideoId(null);
            }}
            isWishlisted={!!currentUser?.favorites?.includes(selectedCourse.id)}
            onToggleWishlist={handleToggleWishlist}
            currentUser={currentUser}
            onTriggerAuth={() => {
              setIsStudying(false);
              setSelectedCourse(null);
              setAuthScreenMode("login");
              setCurrentView("auth");
            }}
            onEnrollCourse={handleEnrollCourse}
            quizzes={quizzes}
            courseVideos={videos}
            onSaveQuizResult={handleSaveQuizResult}
            onSaveExamResult={handleSaveExamResult}
            onViewCertificate={(course, score, date, certId) => {
              setIsStudying(false);
              setActiveCertificate({ course, examScore: score, examDate: date, certificateId: certId });
            }}
            onWatchVideo={handleWatchVideo}
            initialVideoId={initialVideoId}
            paymentTickets={paymentTickets}
          />
        </main>
      ) : selectedCourse ? (
        <main className="flex-1" id="main-course-details-standalone">
          <CourseDetailView
            course={selectedCourse}
            videos={videos}
            currentUser={currentUser}
            onEnroll={handleEnrollCourse}
            onGoBack={handleCloseCourse}
            isEnrolled={
              currentUser?.planType === "pago" ||
              !!currentUser?.enrolledCourseProgress?.some((p) => p.courseId === selectedCourse.id) ||
              paymentTickets.some((t) => t.courseId === selectedCourse.id && t.userId === currentUser?.id && t.status === "APPROVED")
            }
            onOpenStudyModal={(videoId) => {
              setInitialVideoId(videoId || null);
              setIsStudying(true);
            }}
            onLoginTrigger={() => {
              setAuthScreenMode("login");
              setCurrentView("auth");
            }}
            onTriggerNotification={triggerPlatformNotification}
            materials={courseMaterials}
            paymentTickets={paymentTickets}
            onBuy={(c) => {
              setPurchaseCourse(c);
              setIsPurchaseModalOpen(true);
            }}
            onShare={handleShareCourse}
          />
        </main>
      ) : currentView === "auth" ? (
        <main className="flex-1" id="main-auth-portal">
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleRegisterSuccess}
            onCancel={() => {
              handleCloseCourse();
              setPendingCourseForAuth(null);
              try {
                sessionStorage.removeItem("cursaqi_pending_course_id");
              } catch (e) {}
              setCurrentView("home");
            }}
            initialMode={authScreenMode}
          />
        </main>
      ) : currentView === "about" ? (
        <main className="flex-1" id="main-about">
          <AboutView />
        </main>
      ) : currentView === "courses" ? (
        <main className="flex-1" id="main-courses-catalog">
          <CoursesCatalogView
            courses={courses}
            categories={categories}
            videos={videos}
            onViewCourseDetails={handleOpenCourse}
            favorites={currentUser?.favorites || []}
            onToggleWishlist={handleToggleWishlist}
            onShareCourse={handleShareCourse}
          />
        </main>
      ) : currentView === "history" && currentUser ? (
        <main className="flex-1" id="main-history">
          <HistoryView user={currentUser} />
        </main>
      ) : currentView === "certificates" && currentUser ? (
        <main className="flex-1" id="main-certificates">
          <CertificatesView
            user={currentUser}
            courses={courses}
            onViewCertificate={(course, score, date, certId) => {
              setActiveCertificate({ course, examScore: score, examDate: date, certificateId: certId });
            }}
          />
        </main>
      ) : currentView === "payments" && currentUser ? (
        <main className="flex-1" id="main-payments">
          <UserPaymentsView
            currentUser={currentUser}
            courses={courses}
          />
        </main>
      ) : currentView === "profile" && currentUser ? (
        <main className="flex-1" id="main-profile">
          <ProfileView
            user={currentUser}
            onUpdateProfile={(updated) => {
              syncCurrentUser(updated);
            }}
            onLogout={handleLogout}
            onSubscribePremium={handleSubscribePremium}
          />
        </main>
      ) : currentView === "admin" && currentUser?.role === "admin" ? (
        <main className="flex-1" id="main-admin-panel">
          <AdminPanel
            courses={courses}
            categories={categories}
            videos={videos}
            quizzes={quizzes}
            materials={allMaterials}
            banners={banners}
            users={adminUsers}
            onAddCourse={async (newC) => {
              const next = [newC, ...courses];
              await dbSaveCourse(newC);
              saveCoursesToStorage(next);
            }}
            onUpdateCourse={async (updatedC) => {
              const next = courses.map((c) => (c.id === updatedC.id ? updatedC : c));
              await dbSaveCourse(updatedC);
              saveCoursesToStorage(next);
            }}
            onDeleteCourse={async (courseId) => {
              const next = courses.filter((c) => c.id !== courseId);
              await dbDeleteCourse(courseId);
              saveCoursesToStorage(next);
            }}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddVideo={handleAddVideo}
            onDeleteVideo={handleDeleteVideo}
            onUpdateVideo={handleUpdateVideo}
            onAddQuiz={handleAddQuiz}
            onUpdateQuiz={handleUpdateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onAddBanner={handleAddBanner}
            onUpdateBanner={handleUpdateBanner}
            onDeleteBanner={handleDeleteBanner}
            onUpdateUserProfile={handleUpdateUserProfile}
            onDeleteUser={handleDeleteUser}
            onClose={() => setCurrentView("home")}
            paymentMethods={paymentMethods}
            paymentTickets={paymentTickets}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onSavePaymentMethod={handleSavePaymentMethod}
            currentUser={currentUser}
          />
        </main>
      ) : (currentView === "home" || currentView === "dashboard") && currentUser ? (
        /* Academic Summary Homepage dashboard for logged-in students */
        <main className="flex-1" id="main-home-student-dashboard">
          <HomeDashboardView
            user={currentUser}
            courses={courses}
            videos={videos}
            onViewCourseDetails={(c) => {
              handleOpenCourse(c);
            }}
            onNavigateToView={(view) => {
              setCurrentView(view);
            }}
            onOpenStudyModal={(c) => {
              handleOpenCourse(c);
              setIsStudying(true);
            }}
          />
        </main>
      ) : (
        /* Default visitor landing experience loaded for tourists/guests */
        <main className="flex-1 flex flex-col" id="main-home-visitor-explorer">


          {/* Hero section */}
          <Hero onStartLearningClick={handleScrollToCourses} coursesCount={courses.length} />

          {/* Categories bar with interactive filter */}
          <Categories
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              handleScrollToCourses();
            }}
          />

          {/* Banner structures */}
          <CtaBanners
            onLearnMoreLeft={handleScrollToCourses}
            onLearnMoreRight={handleScrollToCourses}
          />

          {/* Popular Courses Section for Guests */}
          <section className="bg-white px-4 md:px-8 scroll-mt-20" style={{ padding: "40px 16px" }} id="popular-courses-anchor">
            <div className="w-full max-w-7xl mx-auto" id="popular-courses-container">
              
              {/* Heading with layout actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-10" id="popular-courses-header">
                <div className="text-left py-1" id="popular-courses-heading-wrap">
                  <h3 className="font-display text-2xl md:text-3.5xl font-bold text-[#0a2540] tracking-tight" id="courses-sec-title">
                    Cursos Disponíveis
                  </h3>
                  <div className="w-12 h-[3px] bg-[#0d9488] mt-2 mb-3" />
                  <p className="text-xs text-slate-500 font-sans" id="courses-sec-byline">
                    Cursos práticos de Informática, redes e programação criados pelo Formador Aldo Valige.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5" id="popular-courses-right-actions">
                  {currentUser && (
                    <button
                      onClick={() => setCurrentView("home")}
                      className="bg-[#0a2540] text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-sm cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                      Ver Meu Painel ({currentUser.fullName})
                    </button>
                  )}
                  
                  {selectedCategoryId && (
                    <span className="text-[10px] bg-[#0d9488]/10 text-[#0d9488] px-2.5 py-1.5 rounded-sm font-mono uppercase font-bold">
                      Filtro: {selectedCategoryId}
                    </span>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSearchQuery("");
                    }}
                    className="border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 transition-colors px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-sm cursor-pointer font-sans"
                    id="view-all-courses-btn"
                  >
                    Mostrar Todos
                  </button>
                </div>
              </div>

              {/* Course Card Grid */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" 
                id="popular-courses-grid"
              >
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isWishlisted={!!currentUser?.favorites?.includes(course.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={handleOpenCourse}
                    onShare={handleShareCourse}
                  />
                ))}

                {filteredCourses.length === 0 && (
                  <div className="col-span-full py-16 bg-slate-50 border border-slate-100 rounded-sm text-center" id="courses-empty-card">
                    <GraduationCap className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-slate-700 text-sm">Nenhum curso coincide com os termos de busca</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Atualize seu termo de busca nas categorias de ensino ou acesse o painel para verificar cadastros.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setSearchQuery("");
                      }}
                      className="mt-4 px-4 py-2 border border-[#0d9488] text-[#0d9488] text-xs font-semibold tracking-wide uppercase hover:bg-teal-50 rounded-sm transition-colors cursor-pointer"
                    >
                      Limpar Filtros Gerais
                    </button>
                  </div>
                )}
              </div>

            </div>
          </section>
        </main>
      )}

      {/* Monochromatic styled educational footer (centralized layout) */}
      <footer className="w-full bg-[#0a2540] border-t border-slate-800 text-white text-center font-sans py-10 px-4" id="cursaqi-footer">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4" id="footer-centered-container">
          {/* Logo with name */}
          <div className="flex items-center gap-2 justify-center" id="footer-logo-row">
            <img 
              src="https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png" 
              alt="CursaQi" 
              className="h-10 w-10 rounded-full object-cover border border-slate-800 shrink-0" 
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-lg font-bold tracking-tight uppercase">
              CUrsaQi
            </span>
          </div>
          
          {/* Description */}
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed" id="footer-tagline">
            Plataforma de cursos online criada pelo Formador Aldo Valige com cursos gratuitos e à venda para quem quer aprender Informática e Tecnologia.
          </p>

          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 mt-2">
            <a href="mailto:infotechvalige@proton.me" className="flex items-center gap-2 hover:text-[#0d9488] transition-colors">
              <Mail className="h-4 w-4 text-[#0d9488]" />
              <span>Suporte: infotechvalige@proton.me</span>
            </a>
            <a href="https://wa.me/258873308934" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#0d9488] transition-colors">
              <MessageCircle className="h-4 w-4 text-[#0d9488]" />
              <span>WhatsApp: +258873308934</span>
            </a>
            <a href="https://tiktok.com/@smartcodai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#0d9488] transition-colors">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#0d9488]" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
              <span>TikTok: tiktok.com/smartcodai</span>
            </a>
          </div>
          
          {/* Separation line */}
          <div className="w-12 h-[1px] bg-slate-800 my-1" />

          {/* Rights reserved */}
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono space-y-1">
            <div>© 2026 CURSAQI. Todos os direitos reservados.</div>
            <div className="text-[9px] text-slate-500">CURSOS ONLINE DE INFORMÁTICA // FORMADOR ALDO VALIGE</div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Verification Banner Layout */}
      {cookiePreference === null && (
        <div 
          className="fixed bottom-0 inset-x-0 z-50 bg-[#0a2540] border-t-2 border-[#0d9488] p-5 text-white text-left shadow-2xl animate-fade-in font-sans"
          id="cookie-consent-banner"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0d9488] font-bold block">
                POLÍTICA DE PRIVACIDADE // VALIDAÇÃO DE COOKIES
              </span>
              <p className="text-slate-300 leading-relaxed max-w-4xl">
                Utilizamos cookies técnicos essenciais de sessão para assegurar o funcionamento da plataforma, acompanhamento do seu progresso nas aulas e segurança no acesso à sua conta. Confirme se autoriza o uso para prosseguir.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0 font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={handleDeclineCookies}
                className="flex-1 lg:flex-none border border-slate-500 hover:border-white text-slate-300 hover:text-white py-2 px-4 rounded-sm text-[10px] transition-colors cursor-pointer"
                id="cookie-decline-btn"
              >
                Recusar opcional
              </button>
              <button
                type="button"
                onClick={handleAcceptCookies}
                className="flex-1 lg:flex-none bg-[#0d9488] hover:bg-[#0f766e] text-white py-2 px-5 rounded-sm text-[10px] transition-colors cursor-pointer"
                id="cookie-accept-btn"
              >
                Aceitar e prosseguir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal Checkout overlay */}
      {isPurchaseModalOpen && purchaseCourse && currentUser && (
        <PurchaseModal
          course={purchaseCourse}
          currentUser={currentUser}
          paymentMethods={paymentMethods}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setPurchaseCourse(null);
          }}
          onTicketCreated={(ticket) => {
            setPaymentTickets(prev => [ticket, ...prev]);
            setIsPurchaseModalOpen(false);
            setPurchaseCourse(null);
            triggerPlatformNotification(
              "com_energia", 
              "Comprovativo Enviado", 
              "Pagamento enviado com sucesso. O seu comprovativo encontra-se em análise."
            );
          }}
        />
      )}

      {/* Social Share Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareModalData.title}
        description={shareModalData.description}
        url={shareModalData.url}
        imageUrl={shareModalData.imageUrl}
        onCopiedToast={(msg) => {
          triggerPlatformNotification("com_energia", "Ligação Copiada!", msg);
        }}
      />

      {/* Mandatory Auth-Wall Modal for guests accessing course contents */}
      <AuthWallModal
        isOpen={isAuthWallOpen}
        onClose={() => {
          setIsAuthWallOpen(false);
          setPendingCourseForAuth(null);
          try {
            sessionStorage.removeItem("cursaqi_pending_course_id");
          } catch (e) {}
        }}
        course={pendingCourseForAuth}
        onGoToRegister={() => {
          setIsAuthWallOpen(false);
          setSelectedCourse(null);
          setAuthScreenMode("register");
          setCurrentView("auth");
        }}
        onGoToLogin={() => {
          setIsAuthWallOpen(false);
          setSelectedCourse(null);
          setAuthScreenMode("login");
          setCurrentView("auth");
        }}
      />

      {/* Live Real-Time Community & Support Chat Widget with Robot Icon */}
      <LiveChatWidget
        currentUser={currentUser}
        onRequireAuth={() => {
          setAuthScreenMode("login");
          setCurrentView("auth");
        }}
      />

    </div>
  );
}
