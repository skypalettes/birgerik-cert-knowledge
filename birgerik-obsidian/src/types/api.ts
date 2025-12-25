/**
 * Birgerik REST API 型定義
 * birgerik API レスポンスの型をコピー
 */

/**
 * 資格と関連する問題集
 */
export interface CertificationWithQuestionSets {
  id: string
  name: string
  description: string | null
  question_sets: QuestionSetSummary[]
}

/**
 * 問題集サマリー（資格一覧に含まれる）
 */
export interface QuestionSetSummary {
  id: string
  name: string
  description: string | null
  question_count: number
}

/**
 * 問題集詳細
 */
export interface QuestionSetDetail {
  id: string
  name: string
  description: string | null
  certification_name: string
  question_count: number
}

/**
 * 問題と選択肢
 */
export interface QuestionWithChoices {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: Choice[]
}

/**
 * 選択肢
 */
export interface Choice {
  id: string
  choice_text: string
  is_correct: boolean
  order_index: number | null
}

/**
 * API レスポンス型
 */

// GET /api/v1/study/certifications
export interface GetCertificationsResponse {
  certifications: CertificationWithQuestionSets[]
}

// GET /api/v1/study/question-sets/:id
export interface GetQuestionSetResponse {
  question_set: QuestionSetDetail
}

// GET /api/v1/study/questions/:questionSetId
export interface GetQuestionsResponse {
  questions: QuestionWithChoices[]
}

// エラーレスポンス
export interface ErrorResponse {
  error: string
}

/**
 * 学習セッション用の型
 */

// ユーザーの回答
export interface UserAnswer {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
  answeredAt: Date
}

// 学習セッション
export interface StudySession {
  questionSetId: string
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
}

// 学習結果
export interface StudyResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  incorrectQuestions: QuestionWithChoices[]
  duration: number // ミリ秒
}
