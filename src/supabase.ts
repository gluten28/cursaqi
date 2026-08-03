import { createClient } from "@supabase/supabase-js";
import { Course, Category, CourseVideo, Quiz, PromoBanner, UserProfile, PlatformNotification, DidacticMaterial, PaymentMethod, PaymentTicket, PaymentNotification, PaymentLog, ExamAttempt } from "./types";
import { initialCategories, initialCourses, initialVideos, initialQuizzes, initialBanners, initialUsers } from "./data";


// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CATEGORIES MAPPING ---
export function mapCategoryToJS(row: any): Category {
  return {
    id: row.id,
    name: row.name || "",
    iconName: row.icon_name || "Code",
    count: Number(row.count ?? 0)
  };
}

export function mapCategoryToDB(c: Category) {
  return {
    id: c.id,
    name: c.name,
    icon_name: c.iconName,
    count: c.count
  };
}

// --- COURSES MAPPING ---
export function mapCourseToJS(row: any): Course {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "",
    tag: row.tag || "",
    lessonsCount: Number(row.lessons_count ?? 0),
    price: Number(row.price ?? 0),
    instructorName: row.instructor_name || "",
    instructorTitle: row.instructor_title,
    instructorAvatar: row.instructor_avatar,
    image: row.image || "",
    description: row.description || "",
    enrolledStudentsCount: Number(row.enrolled_students_count ?? 0),
    rating: Number(row.rating ?? 5),
    skillsCovered: Array.isArray(row.skills_covered) ? row.skills_covered : [],
    isFeatured: !!row.is_featured
  };
}

export function mapCourseToDB(c: Course) {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    tag: c.tag,
    lessons_count: c.lessonsCount,
    price: c.price,
    instructor_name: c.instructorName,
    instructor_title: c.instructorTitle || null,
    instructor_avatar: c.instructorAvatar || null,
    image: c.image,
    description: c.description,
    enrolled_students_count: c.enrolledStudentsCount,
    rating: c.rating,
    skills_covered: c.skillsCovered,
    is_featured: !!c.isFeatured
  };
}

// --- COURSE VIDEOS MAPPING ---
export function mapVideoToJS(row: any): CourseVideo {
  return {
    id: row.id,
    courseId: row.course_id || "",
    title: row.title || "",
    videoUrl: row.video_url || "",
    duration: row.duration || "0:00"
  };
}

export function mapVideoToDB(v: CourseVideo) {
  return {
    id: v.id,
    course_id: v.courseId,
    title: v.title,
    video_url: v.videoUrl,
    duration: v.duration
  };
}

// --- QUIZZES MAPPING ---
export function mapQuizToJS(row: any): Quiz {
  return {
    id: row.id,
    courseId: row.course_id || "",
    question: row.question || "",
    options: Array.isArray(row.options) ? row.options : [],
    correctIndex: Number(row.correct_index ?? 0),
    type: row.type === "exam" ? "exam" : "quiz"
  };
}

export function mapQuizToDB(q: Quiz) {
  return {
    id: q.id,
    course_id: q.courseId,
    question: q.question,
    options: q.options,
    correct_index: q.correctIndex,
    type: q.type || "quiz"
  };
}

// --- DIDACTIC MATERIALS MAPPING ---
export function mapMaterialToJS(row: any): DidacticMaterial {
  return {
    id: row.id,
    courseId: row.course_id || "",
    name: row.name || "",
    type: row.type || "pdf",
    size: row.size || "0 KB",
    url: row.url || ""
  };
}

export function mapMaterialToDB(m: DidacticMaterial) {
  return {
    id: m.id,
    course_id: m.courseId,
    name: m.name,
    type: m.type,
    size: m.size,
    url: m.url
  };
}

// --- PROMO BANNERS MAPPING ---
export function mapBannerToJS(row: any): PromoBanner {
  return {
    id: row.id,
    title: row.title || "",
    subtitle: row.subtitle || "",
    buttonText: row.button_text || "",
    isActive: !!row.is_active,
    imageUrl: row.image_url || undefined,
    courseId: row.course_id || undefined
  };
}

export function mapBannerToDB(b: PromoBanner) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || "",
    button_text: b.buttonText || "",
    is_active: !!b.isActive,
    image_url: b.imageUrl || null,
    course_id: b.courseId || null
  };
}

// --- USERS MAPPING ---
export function mapUserToJS(row: any): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name || "",
    email: row.email || "",
    whatsapp: row.whatsapp || "",
    address: row.address || "",
    role: row.role === "admin" ? "admin" : "user",
    enrolledCourseProgress: Array.isArray(row.enrolled_course_progress) ? row.enrolled_course_progress : [],
    favorites: Array.isArray(row.favorites) ? row.favorites : [],
    planType: row.plan_type === "pago" ? "pago" : "gratuito",
    premiumActivatedAt: row.premium_activated_at || undefined,
    premiumExpiresAt: row.premium_expires_at || undefined,
    quizAnswersTrack: row.quiz_answers_track || {},
    watchedVideos: row.watched_videos || {}
  };
}

export function mapUserToDB(u: UserProfile) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    whatsapp: u.whatsapp,
    address: u.address,
    role: u.role,
    enrolled_course_progress: u.enrolledCourseProgress,
    favorites: u.favorites,
    plan_type: u.planType || "gratuito",
    premium_activated_at: u.premiumActivatedAt || null,
    premium_expires_at: u.premiumExpiresAt || null,
    quiz_answers_track: u.quizAnswersTrack || {},
    watched_videos: u.watchedVideos || {}
  };
}

// --- DB INITIALIZATION & SEEDING ---
export async function seedDatabaseIfEmpty() {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    
    if (error) {
      console.warn("Could not check if users table is empty:", error.message);
      return;
    }

    if (count === 0) {
      console.log("Supabase database has no users. Initiating test admin and student accounts...");
      
      // Seed ONLY test users (admin and student) as explicitly requested for simulator testing
      const mappedUsers = initialUsers.map(mapUserToDB);
      await supabase.from("users").upsert(mappedUsers);

      console.log("Test accounts successfully seeded to the database!");
    }
  } catch (err) {
    console.error("Failed to seed database with test accounts:", err);
  }
}

// --- DATABASE FETCH API IMPLEMENTATION ---

export async function dbGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data ? data.map(mapCategoryToJS) : [];
}

export async function dbGetCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  return data ? data.map(mapCourseToJS) : [];
}

export async function dbGetVideos(): Promise<CourseVideo[]> {
  const { data, error } = await supabase.from("course_videos").select("*");
  if (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
  return data ? data.map(mapVideoToJS) : [];
}

export async function dbGetQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase.from("quizzes").select("*");
  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
  return data ? data.map(mapQuizToJS) : [];
}

export async function dbGetAllMaterials(): Promise<DidacticMaterial[]> {
  const { data, error } = await supabase.from("materials").select("*");
  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
  return data ? data.map(mapMaterialToJS) : [];
}

export async function dbGetMaterials(courseId: string): Promise<DidacticMaterial[]> {
  const { data, error } = await supabase.from("materials").select("*").eq("course_id", courseId);
  if (error) {
    console.error("Error fetching materials for course:", error);
    return [];
  }
  return data ? data.map(mapMaterialToJS) : [];
}

export async function dbGetBanners(): Promise<PromoBanner[]> {
  const { data, error } = await supabase.from("promo_banners").select("*");
  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
  return data ? data.map(mapBannerToJS) : [];
}

export async function dbGetUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error fetching users:", error);
    return initialUsers; // Fallback to initial users so login doesn't break if table isn't created yet
  }
  return data ? data.map(mapUserToJS) : [];
}

// --- UPDATE/SYNC OPERATIONS ---

export async function dbSaveUser(user: UserProfile): Promise<boolean> {
  const dbData = mapUserToDB(user);
  const { error } = await supabase.from("users").upsert(dbData);
  if (error) {
    console.error("Error saving user:", error);
    return false;
  }
  return true;
}

export async function dbSaveCourse(course: Course): Promise<boolean> {
  const dbData = mapCourseToDB(course);
  const { error } = await supabase.from("courses").upsert(dbData);
  if (error) {
    console.error("Error saving course:", error);
    return false;
  }
  return true;
}

export async function dbDeleteCourse(courseId: string): Promise<boolean> {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) {
    console.error("Error deleting course:", error);
    return false;
  }
  return true;
}

export async function dbSaveCategory(category: Category): Promise<boolean> {
  const dbData = mapCategoryToDB(category);
  const { error } = await supabase.from("categories").upsert(dbData);
  if (error) {
    console.error("Error saving category:", error);
    return false;
  }
  return true;
}

export async function dbDeleteCategory(categoryId: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) {
    console.error("Error deleting category:", error);
    return false;
  }
  return true;
}

export async function dbSaveVideo(video: CourseVideo): Promise<boolean> {
  const dbData = mapVideoToDB(video);
  const { error } = await supabase.from("course_videos").upsert(dbData);
  if (error) {
    console.error("Error saving video:", error);
    return false;
  }
  return true;
}

export async function dbDeleteVideo(videoId: string): Promise<boolean> {
  const { error } = await supabase.from("course_videos").delete().eq("id", videoId);
  if (error) {
    console.error("Error deleting video:", error);
    return false;
  }
  return true;
}

export async function dbSaveQuiz(quiz: Quiz): Promise<boolean> {
  const dbData = mapQuizToDB(quiz);
  const { error } = await supabase.from("quizzes").upsert(dbData);
  if (error) {
    console.error("Error saving quiz:", error);
    return false;
  }
  return true;
}

export async function dbDeleteQuiz(quizId: string): Promise<boolean> {
  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
  if (error) {
    console.error("Error deleting quiz:", error);
    return false;
  }
  return true;
}

export async function dbSaveMaterial(material: DidacticMaterial): Promise<boolean> {
  const dbData = mapMaterialToDB(material);
  const { error } = await supabase.from("materials").upsert(dbData);
  if (error) {
    console.error("Error saving material:", error);
    return false;
  }
  return true;
}

export async function dbDeleteMaterial(materialId: string): Promise<boolean> {
  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) {
    console.error("Error deleting material:", error);
    return false;
  }
  return true;
}

// --- EXAM ATTEMPTS ---
export async function dbSaveExamAttempt(attempt: ExamAttempt): Promise<boolean> {
  const dbData = {
    id: attempt.id,
    user_id: attempt.userId,
    course_id: attempt.courseId,
    score: attempt.score,
    passed: attempt.passed,
    certificate_id: attempt.certificateId || null,
    attempted_at: attempt.attemptedAt
  };
  const { error } = await supabase.from("exam_attempts").insert(dbData);
  if (error) {
    // Graceful: table may not exist yet — log but don't crash
    console.warn("Could not save exam attempt (table may not exist):", error.message);
    return false;
  }
  return true;
}

export async function dbGetExamAttempts(userId: string, courseId?: string): Promise<ExamAttempt[]> {
  let query = supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Could not fetch exam attempts:", error.message);
    return [];
  }
  return data ? data.map((row: any): ExamAttempt => ({
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    score: Number(row.score),
    passed: !!row.passed,
    certificateId: row.certificate_id || undefined,
    attemptedAt: row.attempted_at
  })) : [];
}

export async function dbSaveBanner(banner: PromoBanner): Promise<boolean> {
  const dbData = mapBannerToDB(banner);
  const { error } = await supabase.from("promo_banners").upsert(dbData);
  if (error) {
    console.error("Error saving banner:", error);
    return false;
  }
  return true;
}

export async function dbDeleteBanner(bannerId: string): Promise<boolean> {
  const { error } = await supabase.from("promo_banners").delete().eq("id", bannerId);
  if (error) {
    console.error("Error deleting banner:", error);
    return false;
  }
  return true;
}

export async function dbDeleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    console.error("Error deleting user:", error);
    return false;
  }
  return true;
}

// --- NOTIFICATIONS MAPPING & DB FUNCTIONS ---

export function mapNotificationToJS(row: any): PlatformNotification {
  return {
    id: row.id,
    type: row.type || "com_energia",
    title: row.title || "",
    message: row.message || "",
    imageUrl: row.image_url || "",
    timestamp: row.timestamp || "",
    read: !!row.read
  };
}

export function mapNotificationToDB(n: PlatformNotification, userEmail: string) {
  return {
    id: n.id,
    user_email: userEmail,
    type: n.type,
    title: n.title,
    message: n.message,
    image_url: n.imageUrl,
    timestamp: n.timestamp,
    read: n.read
  };
}

// Fetch notifications for a specific user
export async function dbGetNotifications(userEmail: string): Promise<PlatformNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching notifications from DB:", error);
    return [];
  }
  return data ? data.map(mapNotificationToJS) : [];
}

// Save/add a single notification
export async function dbSaveNotification(notification: PlatformNotification, userEmail: string): Promise<boolean> {
  const dbData = mapNotificationToDB(notification, userEmail);
  const { error } = await supabase.from("notifications").upsert(dbData);
  if (error) {
    console.error("Error saving notification to DB:", error);
    return false;
  }
  return true;
}

// Mark all notifications as read
export async function dbMarkAllNotificationsRead(userEmail: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_email", userEmail);
    
  if (error) {
    console.error("Error marking notifications as read in DB:", error);
    return false;
  }
  return true;
}

// Clear all notifications
export async function dbClearNotifications(userEmail: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_email", userEmail);
    
  if (error) {
    console.error("Error clearing notifications from DB:", error);
    return false;
  }
  return true;
}

// --- SECURE AUTHENTICATION HELPERS ---

export async function dbGetSingleUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching single user profile:", error);
    return null;
  }
  return data ? mapUserToJS(data) : null;
}

export async function authSignUp(
  email: string,
  password: string,
  fullName: string,
  whatsapp: string,
  address: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        whatsapp,
        address
      }
    }
  });

  if (error) throw error;
  if (!data.user) return null;

  const profile: UserProfile = {
    id: data.user.id,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    whatsapp: whatsapp.trim(),
    address: address.trim(),
    role: "user",
    enrolledCourseProgress: [],
    favorites: [],
    planType: "gratuito",
    quizAnswersTrack: {},
    watchedVideos: {}
  };

  // Insert the public profile row directly (upsert to handle partial trigger inserts)
  const { error: profileError } = await supabase
    .from("users")
    .upsert(mapUserToDB(profile), { onConflict: "id" });

  if (profileError) {
    console.error("Error creating user profile row:", profileError);
    // Profile insert failed but auth user exists — don't throw, return profile anyway
  }

  return profile;
}

export async function authSignIn(email: string, password: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.user) return null;

  return await dbGetSingleUserProfile(data.user.id);
}

// --- COURSE ENROLLMENT COUNT ---
export async function dbGetCourseEnrollmentCount(courseId: string): Promise<number> {
  // Use a secure RPC function to count enrollments bypassing RLS safely
  const { data, error } = await supabase.rpc('get_course_enrollment_count', { p_course_id: courseId });

  if (error) {
    console.warn(`Error getting enrollment count via RPC for course ${courseId}:`, error.message);
    
    // Fallback attempt (will fail if strict RLS is enabled, but good as a safety net)
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .contains("enrolled_course_progress", JSON.stringify([{ courseId }]));
      
    return count || 0;
  }
  
  return data || 0;
}


// --- PAYMENT MAPPINGS ---
export function mapMethodToJS(row: any): PaymentMethod {
  return {
    id: row.id,
    name: row.name || "",
    type: row.type || "mpesa",
    accountName: row.account_name || "",
    phone: row.phone || "",
    bank: row.bank || "",
    accountNumber: row.account_number || "",
    nib: row.nib || "",
    iban: row.iban || "",
    instructions: row.instructions || "",
    isActive: row.is_active !== false,
    displayOrder: row.display_order || 1
  };
}

export function mapMethodToDB(method: PaymentMethod): any {
  return {
    id: method.id,
    name: method.name,
    type: method.type,
    account_name: method.accountName,
    phone: method.phone,
    bank: method.bank,
    account_number: method.accountNumber,
    nib: method.nib,
    iban: method.iban,
    instructions: method.instructions,
    is_active: method.isActive,
    display_order: method.displayOrder
  };
}

export function mapTicketToJS(row: any): PaymentTicket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number || "",
    userId: row.user_id,
    courseId: row.course_id,
    paymentMethodId: row.payment_method_id,
    amount: Number(row.amount || 0),
    payerPhone: row.payer_phone || "",
    transactionReference: row.transaction_reference || "",
    receiptUrl: row.receipt_url || "",
    status: row.status || "PENDING",
    adminNotes: row.admin_notes || "",
    reviewedBy: row.reviewed_by || "",
    reviewedAt: row.reviewed_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

export function mapTicketToDB(ticket: PaymentTicket): any {
  return {
    id: ticket.id,
    ticket_number: ticket.ticketNumber,
    user_id: ticket.userId,
    course_id: ticket.courseId,
    payment_method_id: ticket.paymentMethodId,
    amount: ticket.amount,
    payer_phone: ticket.payerPhone,
    transaction_reference: ticket.transactionReference,
    receipt_url: ticket.receiptUrl,
    status: ticket.status,
    admin_notes: ticket.adminNotes,
    reviewed_by: ticket.reviewedBy,
    reviewed_at: ticket.reviewedAt
  };
}

// --- PAYMENT DATABASE HELPERS ---
export async function dbGetPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching payment methods:", error.message);
    return [];
  }
  return data ? data.map(mapMethodToJS) : [];
}

export async function dbSavePaymentMethod(method: PaymentMethod): Promise<boolean> {
  const { error } = await supabase
    .from("payment_methods")
    .upsert(mapMethodToDB(method));

  if (error) {
    console.error("Error saving payment method:", error.message);
    return false;
  }
  return true;
}

export async function dbGetPaymentTickets(userId?: string): Promise<PaymentTicket[]> {
  let query = supabase.from("payment_tickets").select("*");
  if (userId) {
    query = query.eq("user_id", userId);
  }
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching payment tickets:", error.message);
    return [];
  }
  return data ? data.map(mapTicketToJS) : [];
}

export async function dbCreatePaymentTicket(
  ticket: Omit<PaymentTicket, "id" | "ticketNumber" | "status" | "createdAt" | "updatedAt">
): Promise<PaymentTicket | null> {
  const { data, error } = await supabase
    .from("payment_tickets")
    .insert({
      user_id: ticket.userId,
      course_id: ticket.courseId,
      payment_method_id: ticket.paymentMethodId,
      amount: ticket.amount,
      payer_phone: ticket.payerPhone,
      transaction_reference: ticket.transactionReference,
      receipt_url: ticket.receiptUrl,
      status: "PENDING"
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating payment ticket:", error.message);
    return null;
  }

  const createdTicket = mapTicketToJS(data);

  // Send notification
  await supabase.from("payment_notifications").insert({
    user_id: ticket.userId,
    ticket_id: createdTicket.id,
    title: "Comprovativo Recebido",
    message: `Recebemos o seu pagamento referente ao ticket ${createdTicket.ticketNumber}. O comprovativo encontra-se em análise.`
  });

  // Write log
  await supabase.from("payment_logs").insert({
    ticket_id: createdTicket.id,
    user_id: ticket.userId,
    action: "TICKET_CREATED",
    description: `Ticket de pagamento criado com a referência de transação ${ticket.transactionReference}.`
  });

  return createdTicket;
}

export async function dbUpdateTicketStatus(
  ticketId: string,
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW",
  adminNotes: string,
  adminId: string
): Promise<boolean> {
  const { data: ticketRow, error: ticketError } = await supabase
    .from("payment_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticketRow) {
    console.error("Error finding ticket for status update:", ticketError?.message);
    return false;
  }

  const ticket = mapTicketToJS(ticketRow);

  const { error: updateError } = await supabase
    .from("payment_tickets")
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", ticketId);

  if (updateError) {
    console.error("Error updating ticket status:", updateError.message);
    return false;
  }

  let title = "";
  let message = "";
  let logAction = "";
  let logDesc = "";

  if (status === "APPROVED") {
    if (ticket.courseId === "PREMIUM_SUBSCRIPTION") {
      title = "Assinatura Premium Aprovada";
      message = "O seu pagamento da assinatura Premium foi aprovado! Agora tem acesso ilimitado a todos os vídeos, materiais e bónus por 90 dias.";
      logAction = "TICKET_APPROVED";
      logDesc = "Assinatura Premium de 90 dias aprovada pelo administrador.";

      const profile = await dbGetSingleUserProfile(ticket.userId);
      if (profile) {
        const now = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(now.getDate() + 90);

        profile.planType = "pago";
        profile.premiumActivatedAt = now.toISOString();
        profile.premiumExpiresAt = expirationDate.toISOString();
        await dbSaveUser(profile);
      }
    } else {
      title = "Pagamento Aprovado";
      message = "O seu pagamento foi aprovado e confirmado. O curso já está disponível no seu painel!";
      logAction = "TICKET_APPROVED";
      logDesc = `Ticket de pagamento aprovado pelo administrador.`;

      const profile = await dbGetSingleUserProfile(ticket.userId);
      if (profile) {
        const exists = profile.enrolledCourseProgress?.some(p => p.courseId === ticket.courseId);
        if (!exists) {
          const newProgress = {
            courseId: ticket.courseId,
            progress: 0,
            currentLessonIndex: 0,
            completedQuizzes: []
          };
          profile.enrolledCourseProgress = [...(profile.enrolledCourseProgress || []), newProgress];
          await dbSaveUser(profile);
        }
      }
    }
  } else if (status === "REJECTED") {
    title = "Pagamento Rejeitado";
    message = `O seu pagamento não pôde ser confirmado. Motivo: ${adminNotes}`;
    logAction = "TICKET_REJECTED";
    logDesc = `Ticket rejeitado pelo administrador. Motivo: ${adminNotes}`;
  } else {
    title = "Pagamento Em Análise";
    message = "O seu pagamento está a ser analisado pelo departamento financeiro.";
    logAction = "TICKET_REVIEW_START";
    logDesc = "Processo de revisão manual iniciado.";
  }

  await supabase.from("payment_notifications").insert({
    user_id: ticket.userId,
    ticket_id: ticketId,
    title,
    message
  });

  await supabase.from("payment_logs").insert({
    ticket_id: ticketId,
    user_id: adminId,
    action: logAction,
    description: logDesc
  });

  return true;
}

export async function dbGetPaymentNotifications(userId: string): Promise<PaymentNotification[]> {
  const { data, error } = await supabase
    .from("payment_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment notifications:", error.message);
    return [];
  }

  return data ? data.map(row => ({
    id: row.id,
    userId: row.user_id,
    ticketId: row.ticket_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at
  })) : [];
}

export async function dbMarkPaymentNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("payment_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking payment notification read:", error.message);
    return false;
  }
  return true;
}

export async function dbGetPaymentLogs(ticketId: string): Promise<PaymentLog[]> {
  const { data, error } = await supabase
    .from("payment_logs")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching payment logs:", error.message);
    return [];
  }

  return data ? data.map(row => ({
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    action: row.action,
    description: row.description,
    createdAt: row.created_at
  })) : [];
}

export async function dbUploadReceipt(
  file: File,
  userId: string,
  ticketNumber: string
): Promise<string | null> {
  // Security: Sanitize inputs to prevent path traversal or invalid characters
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanTicketNumber = ticketNumber.replace(/[^a-zA-Z0-9_-]/g, "");
  
  // Extract and sanitize extension (alphanumeric only, max 5 chars)
  const rawExt = file.name.split('.').pop() || 'png';
  const fileExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toLowerCase();
  
  const filePath = `${cleanUserId}/${cleanTicketNumber}/receipt.${fileExt || 'png'}`;
  
  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Error uploading receipt:", error.message);
    return null;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(filePath, 31536000); // 1 year

  if (signedError) {
    console.error("Error creating signed URL:", signedError.message);
    return null;
  }

  return signedData?.signedUrl || null;
}

export async function dbCheckAndExpirePremium(user: UserProfile): Promise<UserProfile> {
  if (user.planType === "pago" && user.premiumExpiresAt) {
    const expiresAt = new Date(user.premiumExpiresAt);
    if (new Date() > expiresAt) {
      const updatedUser: UserProfile = {
        ...user,
        planType: "gratuito"
      };
      await dbSaveUser(updatedUser);
      return updatedUser;
    }
  }
  return user;
}

export async function dbUploadBannerImage(file: File): Promise<string | null> {
  const rawExt = file.name.split('.').pop() || 'png';
  const fileExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toLowerCase();
  const cleanName = `banner_${Date.now()}.${fileExt}`;
  
  const filePath = `banners/${cleanName}`;
  
  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Error uploading banner image:", error.message);
    return null;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(filePath, 315360000); // 10 years

  if (signedError) {
    console.error("Error creating signed URL for banner image:", signedError.message);
    return null;
  }

  return signedData?.signedUrl || null;
}






