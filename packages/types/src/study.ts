/**
 * 学習セッション関連の型定義
 *
 * このファイルは学習セッション、ユーザーの回答、学習結果に関する型を提供します。
 */

import { QuestionWithChoices } from './api'

/**
 * ユーザーの回答
 *
 * @property {string} questionId - 回答した問題のID（UUID）
 * @property {string[]} selectedChoiceIds - 選択した選択肢のIDの配列
 * @property {boolean} isCorrect - 回答が正解かどうか
 * @property {Date} answeredAt - 回答した日時
 *
 * @example
 * ```typescript
 * const answer: UserAnswer = {
 *   questionId: "550e8400-e29b-41d4-a716-446655440000",
 *   selectedChoiceIds: ["660e8400-..."],
 *   isCorrect: true,
 *   answeredAt: new Date()
 * }
 * ```
 */
export interface UserAnswer {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
  answeredAt: Date
}

/**
 * 学習セッション
 *
 * @property {string} questionSetId - 問題集のID（UUID）
 * @property {string} questionSetName - 問題集の名前
 * @property {string} certificationName - 資格の名前
 * @property {QuestionWithChoices[]} questions - セッション内の問題の配列
 * @property {Map<string, UserAnswer>} userAnswers - 問題IDをキーとした回答のマップ
 * @property {Date} startedAt - セッション開始日時
 * @property {Date} [completedAt] - セッション完了日時（任意）
 *
 * @example
 * ```typescript
 * const session: StudySession = {
 *   questionSetId: "550e8400-...",
 *   questionSetName: "第1回模擬試験",
 *   certificationName: "AWS SAA",
 *   questions: [...],
 *   userAnswers: new Map(),
 *   startedAt: new Date(),
 *   completedAt: undefined
 * }
 * ```
 */
export interface StudySession {
  questionSetId: string
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
}

/**
 * 学習結果
 *
 * @property {number} totalQuestions - 総問題数
 * @property {number} correctCount - 正解数
 * @property {number} incorrectCount - 不正解数
 * @property {number} accuracy - 正答率（0〜100のパーセンテージ）
 * @property {QuestionWithChoices[]} incorrectQuestions - 間違えた問題の配列
 * @property {number} duration - セッションの所要時間（ミリ秒）
 *
 * @example
 * ```typescript
 * const result: StudyResult = {
 *   totalQuestions: 10,
 *   correctCount: 8,
 *   incorrectCount: 2,
 *   accuracy: 80,
 *   incorrectQuestions: [...],
 *   duration: 1200000  // 20分
 * }
 * ```
 */
export interface StudyResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  incorrectQuestions: QuestionWithChoices[]
  duration: number // ミリ秒
}
