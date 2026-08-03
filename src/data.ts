import { Course, Category, CourseVideo, Quiz, PromoBanner, UserProfile, DidacticMaterial } from "./types";

export const initialCategories: Category[] = [
  {
    id: "mathematics",
    name: "Matemática",
    iconName: "Binary",
    count: 0,
  },
  {
    id: "idea-generate",
    name: "Geração de Ideias",
    iconName: "Lightbulb",
    count: 0,
  },
  {
    id: "chemistry",
    name: "Química",
    iconName: "Beaker",
    count: 0,
  },
  {
    id: "business-analysis",
    name: "Análise de Negócios",
    iconName: "TrendingUp",
    count: 0,
  },
  {
    id: "development",
    name: "Desenvolvimento de Software",
    iconName: "Code",
    count: 0,
  },
  {
    id: "email-marketing",
    name: "Marketing por E-mail",
    iconName: "Mail",
    count: 0,
  },
  {
    id: "arestogoy",
    name: "Orientação e Bússola",
    iconName: "Compass",
    count: 0,
  },
  {
    id: "it-technology",
    name: "TI / Tecnologia",
    iconName: "Cpu",
    count: 0,
  },
];

export const initialCourses: Course[] = [
  {
    id: "course-1",
    title: "Abordagens Terapêuticas na Saúde Mental",
    category: "development",
    tag: "DESENVOLVIMENTO",
    lessonsCount: 14,
    price: 0,
    instructorName: "Lucas Vaughn",
    instructorTitle: "Terapeuta Sénior de Saúde Mental e Programador",
    instructorAvatar: "LV",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
    description: "Aprenda abordagens sistemáticas para os princípios terapêuticos e os cuidados da saúde mental. Este programa faz a ponte entre a teoria do desenvolvimento cognitivo moderno e casos clínicos práticos.",
    enrolledStudentsCount: 0,
    rating: 0.0,
    skillsCovered: ["Estruturas Terapêuticas", "Mecânica Cognitivo-Comportamental", "Documentação de Casos"],
    isFeatured: true,
  },
  {
    id: "course-2",
    title: "Criação de Chatbots com GPT da OpenAI",
    category: "it-technology",
    tag: "TECNOLOGIA",
    lessonsCount: 17,
    price: 1850,
    instructorName: "Mark Evans",
    instructorTitle: "Engenheiro de Soluções de Integração de IA",
    instructorAvatar: "ME",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
    description: "Aprofunde-se na mecânica dos modelos OpenAI personalizados, nas estruturas de prompts e nos manipuladores de fluxo com estado. Implemente agentes conscientes do contexto.",
    enrolledStudentsCount: 0,
    rating: 0.0,
    skillsCovered: ["Ajuste Fino de Modelos", "Segurança de APIs", "Gestão de Janelas de Contexto"],
    isFeatured: true,
  },
  {
    id: "course-3",
    title: "Desenvolvimento de Aplicações Móveis com React Native",
    category: "development",
    tag: "DESENVOLVIMENTO",
    lessonsCount: 21,
    price: 0,
    instructorName: "James Foster",
    instructorTitle: "Engenheiro Sénior de Software Multiplataforma",
    instructorAvatar: "JF",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
    description: "Crie aplicações robustas e nativas para iOS e Android usando os paradigmas do React, módulos nativos, gestos personalizados e gestão de estado de alto desempenho.",
    enrolledStudentsCount: 0,
    rating: 0.0,
    skillsCovered: ["React Navigation", "Pontes Nativas (Bridges)", "Análise de Desempenho (Profiling)"],
    isFeatured: true,
  },
  {
    id: "course-4",
    title: "Desafio de Fitness de 30 Dias, Fique em Forma Rapidamente",
    category: "it-technology",
    tag: "FITNESS",
    lessonsCount: 20,
    price: 0,
    instructorName: "David Carter",
    instructorTitle: "Especialista em Cinesiologia e Treino de Alto Rendimento",
    instructorAvatar: "DC",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    description: "Um guia cinesiológico completo para a recuperação física, protocolos de treino de força e a microestruturação metabólica.",
    enrolledStudentsCount: 0,
    rating: 0.0,
    skillsCovered: ["Resistência Metabólica", "Otimização da Recuperação", "Biomecânica Nutricional"],
    isFeatured: true,
  },
];

export const initialVideos: CourseVideo[] = [
  {
    id: "vid-1",
    courseId: "course-1",
    title: "1. Introdução à Abordagem Terapêutica",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "12:35",
  },
  {
    id: "vid-2",
    courseId: "course-1",
    title: "2. Principais Conceitos Psicoemocionais",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "18:40",
  },
  {
    id: "vid-3",
    courseId: "course-2",
    title: "1. OpenAI API Setup & Autenticação",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "09:12",
  },
  {
    id: "vid-4",
    courseId: "course-2",
    title: "2. Desenvolvendo Chatbots com System Prompts",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "24:15",
  },
  {
    id: "vid-5",
    courseId: "course-3",
    title: "1. Preparando o Ambiente React Native",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "15:30",
  },
  {
    id: "vid-6",
    courseId: "course-4",
    title: "1. Aquecimento Geral e Prevenção de Lesões",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "10:45",
  },
];

export const initialQuizzes: Quiz[] = [];

export const initialMaterials: DidacticMaterial[] = [
  {
    id: "mat-1",
    courseId: "course-1",
    name: "Guia_Pratico_TCC_Psicologia.pdf",
    type: "pdf",
    size: "2.4 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "mat-2",
    courseId: "course-2",
    name: "Apostila_Engenharia_Prompts_IA.pdf",
    type: "pdf",
    size: "1.8 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "mat-3",
    courseId: "course-3",
    name: "Manual_React_Native_Especializacao.pdf",
    type: "pdf",
    size: "3.1 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }
];

export const initialBanners: PromoBanner[] = [
  {
    id: "banner-1",
    title: "Semana da Tecnologia CUrsaQi",
    subtitle: "Aproveite 50% de desconto em qualquer curso avançado de Desenvolvimento de Software!",
    buttonText: "Aproveitar Desconto",
    isActive: true,
  },
  {
    id: "banner-2",
    title: "Inscrições Abertas para Novas Formações",
    subtitle: "Aprenda com especialistas de renome da indústria e obtenha certificados reconhecidos.",
    buttonText: "Conhecer Cursos",
    isActive: true,
  }
];

export const initialUsers: UserProfile[] = [
  {
    id: "e87b7a5a-8b1b-4d4b-97c0-10903333aaaa",
    fullName: "Aldo Valige Administrador",
    email: "admin@upstudy.com",
    whatsapp: "+258820000000",
    address: "Avenida de Moçambique, Maputo",
    role: "admin",
    enrolledCourseProgress: [],
    favorites: [],
  },
  {
    id: "998b7a5a-8b1b-4d4b-97c0-10903333bbbb",
    fullName: "Manuel Carlos Silveira",
    email: "student@upstudy.com",
    whatsapp: "+258841234567",
    address: "Bairro da Polana, Maputo",
    role: "user",
    enrolledCourseProgress: [
      {
        courseId: "course-1",
        progress: 35,
        currentLessonIndex: 1,
        completedQuizzes: [],
      }
    ],
    favorites: ["course-1", "course-3"],
  }
];
