import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuestionWithChoices, ExamConfig } from '@birgerik/types'

interface AnswerRecord {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
}

interface ExamState {
  examConfig: ExamConfig | null
  questionSetName: string | null
  certificationName: string | null
  questions: QuestionWithChoices[]
  currentIndex: number
  selectedChoiceIds: string[]
  answerHistory: AnswerRecord[]
  timeRemaining: number
  isTimerRunning: boolean
  isSessionActive: boolean
  isFinished: boolean
  startedAt: number | null
  finishedAt: number | null
}

interface ExamActions {
  startExam: (params: {
    examConfig: ExamConfig
    questionSetName: string
    certificationName: string
    questions: QuestionWithChoices[]
  }) => void
  endExam: () => void
  abandonExam: () => void
  toggleChoice: (choiceId: string, isMultiple: boolean) => void
  saveCurrentAnswer: () => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  tickTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  finishExam: () => void
  getCurrentQuestion: () => QuestionWithChoices | null
  getProgress: () => { current: number; total: number; answeredCount: number }
  getAnswerForQuestion: (questionId: string) => AnswerRecord | undefined
  getExamResult: () => {
    totalQuestions: number
    correctCount: number
    accuracy: number
    passed: boolean
    passingScore: number
    duration: number
    incorrectQuestions: QuestionWithChoices[]
  } | null
  isLastQuestion: () => boolean
  isFirstQuestion: () => boolean
}

const initialState: ExamState = {
  examConfig: null,
  questionSetName: null,
  certificationName: null,
  questions: [],
  currentIndex: 0,
  selectedChoiceIds: [],
  answerHistory: [],
  timeRemaining: 0,
  isTimerRunning: false,
  isSessionActive: false,
  isFinished: false,
  startedAt: null,
  finishedAt: null,
}

function shuffleAndSample<T>(array: T[], count: number): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

export const useExamStore = create<ExamState & ExamActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startExam: ({ examConfig, questionSetName, certificationName, questions }) => {
        const sampled = shuffleAndSample(questions, examConfig.question_count)
        set({
          ...initialState,
          examConfig,
          questionSetName,
          certificationName,
          questions: sampled,
          timeRemaining: examConfig.time_limit_minutes * 60,
          isTimerRunning: true,
          isSessionActive: true,
          startedAt: Date.now(),
        })
      },

      endExam: () => set(initialState),
      abandonExam: () => set(initialState),

      toggleChoice: (choiceId, isMultiple) => {
        if (get().isFinished) return
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

      saveCurrentAnswer: () => {
        const state = get()
        const question = state.questions[state.currentIndex]
        if (!question || state.selectedChoiceIds.length === 0) return

        const correctIds = question.choices
          .filter((c) => c.is_correct)
          .map((c) => c.id)
          .sort()
        const selectedSorted = [...state.selectedChoiceIds].sort()
        const isCorrect =
          correctIds.length === selectedSorted.length &&
          correctIds.every((id, i) => id === selectedSorted[i])

        const record: AnswerRecord = {
          questionId: question.id,
          selectedChoiceIds: state.selectedChoiceIds,
          isCorrect,
        }
        set((s) => ({
          answerHistory: [
            ...s.answerHistory.filter((h) => h.questionId !== question.id),
            record,
          ],
        }))
      },

      goToQuestion: (index) => {
        get().saveCurrentAnswer()
        const prev = get().answerHistory.find(
          (h) => h.questionId === get().questions[index]?.id
        )
        set({
          currentIndex: index,
          selectedChoiceIds: prev?.selectedChoiceIds ?? [],
        })
      },

      nextQuestion: () => {
        get().saveCurrentAnswer()
        const state = get()
        if (state.currentIndex >= state.questions.length - 1) return
        const next = state.currentIndex + 1
        const prev = state.answerHistory.find(
          (h) => h.questionId === state.questions[next]?.id
        )
        set({ currentIndex: next, selectedChoiceIds: prev?.selectedChoiceIds ?? [] })
      },

      previousQuestion: () => {
        get().saveCurrentAnswer()
        const state = get()
        if (state.currentIndex === 0) return
        const prev = state.currentIndex - 1
        const prevAnswer = state.answerHistory.find(
          (h) => h.questionId === state.questions[prev]?.id
        )
        set({ currentIndex: prev, selectedChoiceIds: prevAnswer?.selectedChoiceIds ?? [] })
      },

      tickTimer: () => {
        set((s) => {
          if (!s.isTimerRunning || s.timeRemaining <= 0) return {}
          const next = s.timeRemaining - 1
          if (next <= 0) {
            return { timeRemaining: 0, isTimerRunning: false }
          }
          return { timeRemaining: next }
        })
      },

      pauseTimer: () => set({ isTimerRunning: false }),
      resumeTimer: () => set({ isTimerRunning: true }),

      finishExam: () => {
        get().saveCurrentAnswer()
        set({ isFinished: true, isTimerRunning: false, finishedAt: Date.now() })
      },

      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] ?? null
      },

      getProgress: () => {
        const { currentIndex, questions, answerHistory } = get()
        return {
          current: currentIndex + 1,
          total: questions.length,
          answeredCount: answerHistory.length,
        }
      },

      getAnswerForQuestion: (questionId) =>
        get().answerHistory.find((h) => h.questionId === questionId),

      getExamResult: () => {
        const state = get()
        if (!state.isFinished || !state.examConfig) return null
        const { answerHistory, questions, startedAt, finishedAt, examConfig } = state
        const correctCount = answerHistory.filter((h) => h.isCorrect).length
        const totalQuestions = questions.length
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
        const wrongIds = new Set(answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId))
        return {
          totalQuestions,
          correctCount,
          accuracy,
          passed: accuracy >= examConfig.passing_score,
          passingScore: examConfig.passing_score,
          duration: finishedAt && startedAt ? finishedAt - startedAt : 0,
          incorrectQuestions: questions.filter((q) => wrongIds.has(q.id)),
        }
      },

      isLastQuestion: () => {
        const { currentIndex, questions } = get()
        return currentIndex === questions.length - 1
      },

      isFirstQuestion: () => get().currentIndex === 0,
    }),
    {
      name: 'birgerik-exam-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
