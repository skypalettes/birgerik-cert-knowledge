// ==================== データモデル ====================

export interface CertificationWithQuestionSets {
  id: string
  name: string
  description: string | null
  question_sets: QuestionSetSummary[]
}

export interface QuestionSetSummary {
  id: string
  name: string
  description: string | null
  question_count: number
  is_active: boolean
  has_exam: boolean
}

export interface QuestionSetDetail {
  id: string
  name: string
  description: string | null
  certification_name: string
  question_count: number
  is_active: boolean
}

export interface QuestionWithChoices {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: Choice[]
}

export interface Choice {
  id: string
  choice_text: string
  is_correct: boolean
  order_index: number | null
}

// ==================== 試験設定 ====================

export interface ExamConfig {
  id: string
  question_set_id: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
}

// ==================== API レスポンス ====================

export interface GetCertificationsResponse {
  certifications: CertificationWithQuestionSets[]
}

export interface GetQuestionSetResponse {
  question_set: QuestionSetDetail
}

export interface GetQuestionsResponse {
  questions: QuestionWithChoices[]
}

export interface GetExamConfigResponse {
  exam: ExamConfig
}

export interface ErrorResponse {
  error: string
}

export interface SuccessResponse<T> {
  success: true
  data: T
}
