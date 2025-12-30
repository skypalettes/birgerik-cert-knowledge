/**
 * Birgerik API型定義
 * API リクエスト・レスポンスの共通型
 *
 * このファイルはBirgerikのメインアプリケーションとクライアント（Obsidianプラグインなど）間で
 * 共有される型定義を提供します。
 */

/**
 * 資格と関連する問題集
 *
 * @property {string} id - 資格の一意識別子（UUID）
 * @property {string} name - 資格名（例: "AWS Certified Solutions Architect"）
 * @property {string | null} description - 資格の説明（任意）
 * @property {QuestionSetSummary[]} question_sets - この資格に関連する問題集の配列
 *
 * @example
 * ```typescript
 * const cert: CertificationWithQuestionSets = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "AWS SAA",
 *   description: "AWS Solutions Architect Associate",
 *   question_sets: [...]
 * }
 * ```
 */
export interface CertificationWithQuestionSets {
  id: string
  name: string
  description: string | null
  question_sets: QuestionSetSummary[]
}

/**
 * 問題集サマリー（資格一覧に含まれる）
 *
 * @property {string} id - 問題集の一意識別子（UUID）
 * @property {string} name - 問題集名（例: "第1回模擬試験"）
 * @property {string | null} description - 問題集の説明（任意）
 * @property {number} question_count - この問題集に含まれる問題の数
 */
export interface QuestionSetSummary {
  id: string
  name: string
  description: string | null
  question_count: number
}

/**
 * 問題集詳細
 *
 * @property {string} id - 問題集の一意識別子（UUID）
 * @property {string} name - 問題集名
 * @property {string | null} description - 問題集の説明（任意）
 * @property {string} certification_name - この問題集が属する資格の名前
 * @property {number} question_count - この問題集に含まれる問題の数
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
 *
 * @property {string} id - 問題の一意識別子（UUID）
 * @property {string} question_text - 問題文（Markdown形式）
 * @property {string | null} explanation - 解説文（Markdown形式、任意）
 * @property {boolean} is_multiple_choice - 複数選択可能かどうか（true: 複数選択、false: 単一選択）
 * @property {number | null} order_index - 問題の表示順序（0から始まる、任意）
 * @property {Choice[]} choices - 選択肢の配列
 *
 * @example
 * ```typescript
 * const question: QuestionWithChoices = {
 *   id: "550e8400-...",
 *   question_text: "## AWS S3とは？\n\nAWS S3の説明として正しいものを選んでください。",
 *   explanation: "S3はSimple Storage Serviceの略で...",
 *   is_multiple_choice: false,
 *   order_index: 0,
 *   choices: [...]
 * }
 * ```
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
 *
 * @property {string} id - 選択肢の一意識別子（UUID）
 * @property {string} choice_text - 選択肢のテキスト（Markdown形式）
 * @property {boolean} is_correct - この選択肢が正解かどうか
 * @property {number | null} order_index - 選択肢の表示順序（0から始まる、任意）
 *
 * @example
 * ```typescript
 * const choice: Choice = {
 *   id: "660e8400-...",
 *   choice_text: "オブジェクトストレージサービス",
 *   is_correct: true,
 *   order_index: 0
 * }
 * ```
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

// 成功レスポンス（ジェネリック）
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}
