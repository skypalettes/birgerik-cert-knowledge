import { createStore } from 'zustand/vanilla'
import { useSyncExternalStore } from 'preact/compat'
import type {
  QuestionWithChoices,
  UserAnswer,
  StudySession,
  StudyResult,
} from '@/types/api'

/**
 * 学習画面の状態
 */
export type StudyScreen = 'certifications' | 'question-sets' | 'study' | 'result'

/**
 * Zustand ストア型定義
 */
interface StudyStore {
  // 画面状態
  currentScreen: StudyScreen
  setCurrentScreen: (screen: StudyScreen) => void

  // 選択された資格・問題セット
  selectedCertificationId: string | null
  selectedQuestionSetId: string | null
  setSelectedCertification: (certId: string) => void
  setSelectedQuestionSet: (setId: string) => void

  // 学習セッション
  session: StudySession | null
  startSession: (
    questionSetId: string,
    questionSetName: string,
    certificationName: string,
    questions: QuestionWithChoices[]
  ) => void
  endSession: () => void

  // 現在の問題
  currentQuestionIndex: number
  getCurrentQuestion: () => QuestionWithChoices | null
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void

  // 回答
  userAnswers: Map<string, UserAnswer>
  submitAnswer: (questionId: string, selectedChoiceIds: string[]) => void
  hasAnswered: (questionId: string) => boolean
  getAnswer: (questionId: string) => UserAnswer | undefined

  // 結果
  result: StudyResult | null
  calculateResult: () => void
  clearResult: () => void

  // リセット
  reset: () => void
}

/**
 * 学習状態管理ストア (Vanilla)
 */
export const studyStore = createStore<StudyStore>((set, get) => ({
  // 初期状態
  currentScreen: 'certifications',
  selectedCertificationId: null,
  selectedQuestionSetId: null,
  session: null,
  currentQuestionIndex: 0,
  userAnswers: new Map(),
  result: null,

  // 画面遷移
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  // 資格・問題セット選択
  setSelectedCertification: (certId) =>
    set({ selectedCertificationId: certId, currentScreen: 'question-sets' }),

  setSelectedQuestionSet: (setId) => set({ selectedQuestionSetId: setId }),

  // セッション開始
  startSession: (questionSetId, questionSetName, certificationName, questions) => {
    set({
      session: {
        questionSetId,
        questionSetName,
        certificationName,
        questions,
        userAnswers: new Map(),
        startedAt: new Date(),
      },
      currentQuestionIndex: 0,
      userAnswers: new Map(),
      currentScreen: 'study',
      result: null,
    })
  },

  // セッション終了
  endSession: () => {
    const { session } = get()
    if (session) {
      set({
        session: {
          ...session,
          completedAt: new Date(),
        },
      })
    }
  },

  // 現在の問題を取得
  getCurrentQuestion: () => {
    const { session, currentQuestionIndex } = get()
    if (!session || currentQuestionIndex >= session.questions.length) {
      return null
    }
    return session.questions[currentQuestionIndex]
  },

  // 次の問題へ
  nextQuestion: () => {
    const { session, currentQuestionIndex } = get()
    if (session && currentQuestionIndex < session.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },

  // 前の問題へ
  previousQuestion: () => {
    const { currentQuestionIndex } = get()
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 })
    }
  },

  // 指定の問題へ
  goToQuestion: (index) => {
    const { session } = get()
    if (session && index >= 0 && index < session.questions.length) {
      set({ currentQuestionIndex: index })
    }
  },

  // 回答を提出
  submitAnswer: (questionId, selectedChoiceIds) => {
    const { session, userAnswers } = get()
    if (!session) return

    const question = session.questions.find((q) => q.id === questionId)
    if (!question) return

    // 正誤判定
    const correctChoiceIds = question.choices
      .filter((c) => c.is_correct)
      .map((c) => c.id)
      .sort()

    const isCorrect =
      selectedChoiceIds.length === correctChoiceIds.length &&
      selectedChoiceIds.sort().every((id, index) => id === correctChoiceIds[index])

    const answer: UserAnswer = {
      questionId,
      selectedChoiceIds,
      isCorrect,
      answeredAt: new Date(),
    }

    const newAnswers = new Map(userAnswers)
    newAnswers.set(questionId, answer)

    set({ userAnswers: newAnswers })
  },

  // 回答済みかチェック
  hasAnswered: (questionId) => {
    const { userAnswers } = get()
    return userAnswers.has(questionId)
  },

  // 回答を取得
  getAnswer: (questionId) => {
    const { userAnswers } = get()
    return userAnswers.get(questionId)
  },

  // 結果を計算
  calculateResult: () => {
    const { session, userAnswers } = get()
    if (!session) return

    const totalQuestions = session.questions.length
    const answeredQuestions = Array.from(userAnswers.values())
    const correctCount = answeredQuestions.filter((a) => a.isCorrect).length
    const incorrectCount = answeredQuestions.filter((a) => !a.isCorrect).length
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0

    // 間違えた問題を取得
    const incorrectQuestionIds = answeredQuestions
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId)

    const incorrectQuestions = session.questions.filter((q) =>
      incorrectQuestionIds.includes(q.id)
    )

    // 所要時間を計算
    const duration = session.completedAt
      ? session.completedAt.getTime() - session.startedAt.getTime()
      : Date.now() - session.startedAt.getTime()

    const result: StudyResult = {
      totalQuestions,
      correctCount,
      incorrectCount,
      accuracy,
      incorrectQuestions,
      duration,
    }

    set({ result, currentScreen: 'result' })
  },

  // 結果をクリア
  clearResult: () => set({ result: null }),

  // すべてリセット
  reset: () =>
    set({
      currentScreen: 'certifications',
      selectedCertificationId: null,
      selectedQuestionSetId: null,
      session: null,
      currentQuestionIndex: 0,
      userAnswers: new Map(),
      result: null,
    }),
}))

/**
 * Preact用のフック（セレクター付き）
 */
export function useStudyStore<T>(selector: (state: StudyStore) => T): T {
  return useSyncExternalStore(
    studyStore.subscribe,
    () => selector(studyStore.getState()),
    () => selector(studyStore.getState())
  )
}

/**
 * Preact用のフック（全ての状態を取得）
 */
export function useStudyStoreAll(): StudyStore {
  return useSyncExternalStore(
    studyStore.subscribe,
    studyStore.getState,
    studyStore.getState
  )
}
