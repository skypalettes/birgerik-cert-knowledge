import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuestionWithChoices } from '@birgerik/types'

type StudyMode = 'random' | 'review'

interface AnswerHistory {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
}

interface StudyState {
  questionSetId: string | null
  questionSetName: string | null
  certificationName: string | null
  mode: StudyMode | null
  questions: QuestionWithChoices[]
  currentIndex: number
  selectedChoiceIds: string[]
  answerHistory: AnswerHistory[]
  isAnswerSubmitted: boolean
  showExplanation: boolean
  isSessionActive: boolean
}

interface StudyActions {
  startSession: (params: {
    questionSetId: string
    questionSetName: string
    certificationName: string
    questions: QuestionWithChoices[]
    mode: StudyMode
  }) => void
  endSession: () => void
  toggleChoice: (choiceId: string, isMultiple: boolean) => void
  submitAnswer: () => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  toggleExplanation: () => void
  resetCurrentAnswer: () => void
  startReviewSession: () => void
  getCurrentQuestion: () => QuestionWithChoices | null
  getProgress: () => { current: number; total: number; percentage: number }
  getScore: () => { correct: number; total: number; percentage: number }
  getWrongQuestions: () => QuestionWithChoices[]
  isLastQuestion: () => boolean
  isFirstQuestion: () => boolean
}

const initialState: StudyState = {
  questionSetId: null,
  questionSetName: null,
  certificationName: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  selectedChoiceIds: [],
  answerHistory: [],
  isAnswerSubmitted: false,
  showExplanation: false,
  isSessionActive: false,
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const useStudyStore = create<StudyState & StudyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: ({ questionSetId, questionSetName, certificationName, questions, mode }) => {
        const shuffledQuestions = shuffleArray(questions).map((q) => ({
          ...q,
          choices: shuffleArray(q.choices),
        }))
        set({
          ...initialState,
          questionSetId,
          questionSetName,
          certificationName,
          mode,
          questions: shuffledQuestions,
          isSessionActive: true,
        })
      },

      endSession: () => set(initialState),

      toggleChoice: (choiceId, isMultiple) => {
        if (get().isAnswerSubmitted) return
        set((state) => {
          if (isMultiple) {
            const exists = state.selectedChoiceIds.includes(choiceId)
            return {
              selectedChoiceIds: exists
                ? state.selectedChoiceIds.filter((id) => id !== choiceId)
                : [...state.selectedChoiceIds, choiceId],
            }
          }
          return { selectedChoiceIds: [choiceId] }
        })
      },

      submitAnswer: () => {
        const state = get()
        const question = state.questions[state.currentIndex]
        if (!question || state.isAnswerSubmitted) return

        const correctIds = question.choices
          .filter((c) => c.is_correct)
          .map((c) => c.id)
          .sort()
        const selectedSorted = [...state.selectedChoiceIds].sort()
        const isCorrect =
          correctIds.length === selectedSorted.length &&
          correctIds.every((id, i) => id === selectedSorted[i])

        const record: AnswerHistory = {
          questionId: question.id,
          selectedChoiceIds: state.selectedChoiceIds,
          isCorrect,
        }

        set((s) => ({
          isAnswerSubmitted: true,
          answerHistory: [
            ...s.answerHistory.filter((h) => h.questionId !== question.id),
            record,
          ],
        }))
      },

      nextQuestion: () =>
        set((s) => ({
          currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        })),

      previousQuestion: () =>
        set((s) => ({
          currentIndex: Math.max(s.currentIndex - 1, 0),
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        })),

      goToQuestion: (index) =>
        set({
          currentIndex: index,
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        }),

      toggleExplanation: () => set((s) => ({ showExplanation: !s.showExplanation })),

      resetCurrentAnswer: () =>
        set({ selectedChoiceIds: [], isAnswerSubmitted: false, showExplanation: false }),

      startReviewSession: () => {
        const state = get()
        const wrongIds = new Set(
          state.answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId)
        )
        const wrongQuestions = shuffleArray(
          state.questions.filter((q) => wrongIds.has(q.id))
        ).map((q) => ({ ...q, choices: shuffleArray(q.choices) }))
        set({
          ...initialState,
          questionSetId: state.questionSetId,
          questionSetName: state.questionSetName,
          certificationName: state.certificationName,
          mode: 'review',
          questions: wrongQuestions,
          isSessionActive: true,
        })
      },

      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] ?? null
      },

      getProgress: () => {
        const { currentIndex, questions } = get()
        const total = questions.length
        return {
          current: currentIndex + 1,
          total,
          percentage: total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0,
        }
      },

      getScore: () => {
        const { answerHistory, questions } = get()
        const correct = answerHistory.filter((h) => h.isCorrect).length
        return {
          correct,
          total: questions.length,
          percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
        }
      },

      getWrongQuestions: () => {
        const { questions, answerHistory } = get()
        const wrongIds = new Set(
          answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId)
        )
        return questions.filter((q) => wrongIds.has(q.id))
      },

      isLastQuestion: () => {
        const { currentIndex, questions } = get()
        return currentIndex === questions.length - 1
      },

      isFirstQuestion: () => get().currentIndex === 0,
    }),
    {
      name: 'birgerik-study-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
