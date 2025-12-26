import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuestionWithChoices, UserAnswer } from '@birgerik/types'

/**
 * 問題の型エイリアス
 */
export type Question = QuestionWithChoices

/**
 * ユーザーの回答履歴の型エイリアス
 */
export type AnswerHistory = UserAnswer

/**
 * 学習セッションの状態
 */
interface StudyState {
  // 基本情報
  questionSetId: string | null
  questionSetName: string | null
  certificationId: string | null
  mode: 'sequential' | 'random' | null
  
  // 問題データ
  questions: Question[]
  currentIndex: number
  
  // ユーザー回答
  selectedChoiceIds: string[]
  answerHistory: AnswerHistory[]
  
  // UI状態
  isAnswerSubmitted: boolean
  showExplanation: boolean
  isSessionActive: boolean
  
  // アクション: セッション管理
  startSession: (params: {
    questionSetId: string
    questionSetName: string
    certificationId: string
    questions: Question[]
    mode: 'sequential' | 'random'
  }) => void
  
  endSession: () => void
  
  // アクション: 回答操作
  toggleChoice: (choiceId: string, isMultiple: boolean) => void
  submitAnswer: () => void
  
  // アクション: ナビゲーション
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  
  // アクション: UI状態
  toggleExplanation: () => void
  resetCurrentAnswer: () => void
  
  // 計算プロパティ
  getCurrentQuestion: () => Question | null
  getProgress: () => { current: number; total: number; percentage: number }
  getScore: () => { correct: number; total: number; percentage: number }
  isLastQuestion: () => boolean
  isFirstQuestion: () => boolean

  getWrongQuestions: () => Question[]
  startReviewSession: () => void
}

/**
 * セッション情報をリセット
 */
const getInitialState = () => ({
  questionSetId: null,
  questionSetName: null,
  certificationId: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  selectedChoiceIds: [],
  answerHistory: [],
  isAnswerSubmitted: false,
  showExplanation: false,
  isSessionActive: false,
})

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      
      // セッション開始
      startSession: (params) => {
        const questions = params.mode === 'random' 
          ? shuffleArray([...params.questions])
          : params.questions
        
        set({
          questionSetId: params.questionSetId,
          questionSetName: params.questionSetName,
          certificationId: params.certificationId,
          questions,
          mode: params.mode,
          currentIndex: 0,
          selectedChoiceIds: [],
          answerHistory: [],
          isAnswerSubmitted: false,
          showExplanation: false,
          isSessionActive: true,
        })
      },
      
      // セッション終了
      endSession: () => {
        set(getInitialState())
      },
      
      // 選択肢のトグル
      toggleChoice: (choiceId, isMultiple) => {
        const { selectedChoiceIds, isAnswerSubmitted } = get()
        
        // 既に回答済みの場合は変更不可
        if (isAnswerSubmitted) return
        
        if (isMultiple) {
          // 複数選択: トグル
          const newSelection = selectedChoiceIds.includes(choiceId)
            ? selectedChoiceIds.filter(id => id !== choiceId)
            : [...selectedChoiceIds, choiceId]
          set({ selectedChoiceIds: newSelection })
        } else {
          // 単一選択: 置き換え
          set({ selectedChoiceIds: [choiceId] })
        }
      },
      
      // 回答を提出
      submitAnswer: () => {
        const { 
          questions, 
          currentIndex, 
          selectedChoiceIds, 
          answerHistory 
        } = get()
        
        const currentQuestion = questions[currentIndex]
        if (!currentQuestion) return
        
        // 正解判定
        const correctChoiceIds = currentQuestion.choices
          .filter(c => c.is_correct)
          .map(c => c.id)
          .sort()
        
        const selectedSorted = [...selectedChoiceIds].sort()
        const isCorrect = 
          correctChoiceIds.length === selectedSorted.length &&
          correctChoiceIds.every((id, index) => id === selectedSorted[index])
        
        // 履歴に追加
        const newHistory: AnswerHistory = {
          questionId: currentQuestion.id,
          selectedChoiceIds,
          isCorrect,
          answeredAt: new Date(),
        }
        
        set({
          isAnswerSubmitted: true,
          showExplanation: true,
          answerHistory: [...answerHistory, newHistory],
        })
      },
      
      // 次の問題へ
      nextQuestion: () => {
        const { questions, currentIndex } = get()
        if (currentIndex < questions.length - 1) {
          set({
            currentIndex: currentIndex + 1,
            selectedChoiceIds: [],
            isAnswerSubmitted: false,
            showExplanation: false,
          })
        }
      },
      
      // 前の問題へ
      previousQuestion: () => {
        const { currentIndex } = get()
        if (currentIndex > 0) {
          set({
            currentIndex: currentIndex - 1,
            selectedChoiceIds: [],
            isAnswerSubmitted: false,
            showExplanation: false,
          })
        }
      },
      
      // 指定した問題へジャンプ
      goToQuestion: (index) => {
        const { questions } = get()
        if (index >= 0 && index < questions.length) {
          set({
            currentIndex: index,
            selectedChoiceIds: [],
            isAnswerSubmitted: false,
            showExplanation: false,
          })
        }
      },
      
      // 解説の表示切り替え
      toggleExplanation: () => {
        set(state => ({ showExplanation: !state.showExplanation }))
      },
      
      // 現在の回答をリセット
      resetCurrentAnswer: () => {
        set({
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        })
      },
      
      // 現在の問題を取得
      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] || null
      },
      
      // 進捗を取得
      getProgress: () => {
        const { questions, currentIndex } = get()
        const total = questions.length
        const current = currentIndex + 1
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0
        return { current, total, percentage }
      },
      
      // スコアを取得
      getScore: () => {
        const { answerHistory } = get()
        const total = answerHistory.length
        const correct = answerHistory.filter(h => h.isCorrect).length
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
        return { correct, total, percentage }
      },
      
      // 最後の問題かどうか
      isLastQuestion: () => {
        const { questions, currentIndex } = get()
        return currentIndex === questions.length - 1
      },
      
      // 最初の問題かどうか
      isFirstQuestion: () => {
        const { currentIndex } = get()
        return currentIndex === 0
      },

      // 間違えた問題を取得
      getWrongQuestions: () => {
        const { questions, answerHistory } = get()
        
        // 間違えた問題のIDを取得
        const wrongQuestionIds = answerHistory
          .filter(h => !h.isCorrect)
          .map(h => h.questionId)
        
        // 重複を除去
        const uniqueWrongIds = Array.from(new Set(wrongQuestionIds))
        
        // 間違えた問題のみ返す
        return questions.filter(q => uniqueWrongIds.includes(q.id))
      },

      // 間違えた問題で復習セッションを開始
      startReviewSession: () => {
        const wrongQuestions = get().getWrongQuestions()
        
        if (wrongQuestions.length === 0) {
          console.warn('復習する問題がありません')
          return
        }

        // 現在のセッション情報を保持しつつ、問題だけ置き換え
        set({
          questions: wrongQuestions,
          currentIndex: 0,
          selectedChoiceIds: [],
          answerHistory: [], // 復習用の新しい履歴
          isAnswerSubmitted: false,
          showExplanation: false,
        })
      },
    }),
    {
      name: 'birgerik-study-session',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}