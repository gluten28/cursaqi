export interface Course {
  id: string;
  title: string;
  category: string;
  tag: string; // e.g. "DEVELOPMENT", "LANGUAGE", "FITNESS", "MARKETING", "DESIGN"
  lessonsCount: number;
  price: number; // 0 for Free, or positive values
  instructorName: string;
  instructorTitle?: string;
  instructorAvatar?: string;
  image: string;
  description: string;
  enrolledStudentsCount: number;
  rating: number;
  skillsCovered: string[];
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // e.g., "Code", "Binary"
  count: number;
}

export interface CourseVideo {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string; // e.g. YouTube EMBED or placeholder link
  duration: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctIndex: number;
  type?: "quiz" | "exam"; // 'quiz' = quiz rápido de aula; 'exam' = exame final
}

export interface ExamAttempt {
  id: string;
  userId: string;
  courseId: string;
  score: number;          // 0 a 100 (percentagem)
  passed: boolean;        // true se score >= 80
  certificateId?: string; // ID do certificado gerado ao passar
  attemptedAt: string;    // ISO timestamp
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  isActive: boolean;
  imageUrl?: string;
  courseId?: string; // Optional: links CTA button to a specific course
}

export interface UserProgress {
  courseId: string;
  progress: number; // 0 to 100
  currentLessonIndex: number;
  completedQuizzes: string[]; // quizIds completed
  examScore?: number; // 0 to 100 (percentage)
  examDate?: string; // Date of completion
  certificateId?: string; // Unique certificate ID
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  address: string;
  role: "admin" | "user";
  enrolledCourseProgress: UserProgress[];
  favorites: string[]; // array of courseIds
  planType?: "gratuito" | "pago"; // "gratuito" by default, can upgrade to "pago"
  premiumActivatedAt?: string; // ISO date of activation
  premiumExpiresAt?: string; // ISO date of expiration
  quizAnswersTrack?: Record<string, { 
    isCorrect: boolean; 
    selectedOption: string; 
    questionText: string; 
    date: string; 
    courseTitle: string; 
  }>;
  watchedVideos?: Record<string, { 
    date: string; 
    videoTitle: string; 
    courseTitle: string; 
  }>;
}

export const PREMIUM_SUBSCRIPTION_PRICE = 1799;
export const PREMIUM_SUBSCRIPTION_DAYS = 90;
export const PREMIUM_SUBSCRIPTION_ID = "PREMIUM_SUBSCRIPTION";


export interface PlatformNotification {
  id: string;
  type: string; // e.g. "amando", "com_energia", "confiante" etc.
  title: string;
  message: string;
  imageUrl: string;
  timestamp: string;
  read: boolean;
}

export interface DidacticMaterial {
  id: string;
  courseId: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string; // e.g. "mpesa", "emola", "bank"
  accountName?: string;
  phone?: string;
  bank?: string;
  accountNumber?: string;
  nib?: string;
  iban?: string;
  instructions?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface PaymentTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  courseId: string;
  paymentMethodId: string;
  amount: number;
  payerPhone?: string;
  transactionReference: string;
  receiptUrl: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentNotification {
  id: string;
  userId: string;
  ticketId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  description: string;
  createdAt: string;
}

export type ChatCategory = "ideia" | "pergunta" | "sugestao" | "ajuda" | "geral";

export interface ChatMessage {
  id: string;
  userId?: string;
  authorName: string;
  authorRole: "admin" | "formador" | "aluno" | "visitante";
  message: string;
  category: ChatCategory;
  createdAt: string;
}
