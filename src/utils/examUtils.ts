import { Quiz } from "../types";

/**
 * Baralha um array usando o algoritmo Fisher-Yates.
 * Retorna o array baralhado e o mapeamento de índices.
 */
function fisherYatesShuffle<T>(arr: T[]): { shuffled: T[]; indexMap: number[] } {
  const shuffled = [...arr];
  const indexMap = shuffled.map((_, i) => i);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    [indexMap[i], indexMap[j]] = [indexMap[j], indexMap[i]];
  }
  return { shuffled, indexMap };
}

/**
 * Baralha as perguntas do exame final E as opções de cada pergunta,
 * atualizando correctIndex após o shuffle das opções.
 */
export function shuffleExamQuestions(questions: Quiz[]): Quiz[] {
  if (!questions || questions.length === 0) return [];
  const { shuffled: shuffledQuestions } = fisherYatesShuffle(questions);
  return shuffledQuestions.map((q) => {
    const { shuffled: shuffledOptions, indexMap } = fisherYatesShuffle(q.options);
    const newCorrectIndex = indexMap.indexOf(q.correctIndex);
    return { ...q, options: shuffledOptions, correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0 };
  });
}

/**
 * Obtém as perguntas cadastradas para o Exame Final de um curso específico.
 */
export function getFinalExamQuestions(courseId: string, quizzes: Quiz[] = []): Quiz[] {
  if (!Array.isArray(quizzes)) return [];
  return quizzes.filter((q) => q.courseId === courseId && q.type === "exam");
}
