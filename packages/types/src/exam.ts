import type { QuestionWithChoices, ExamConfig } from './api'
import type { UserAnswer } from './study'

export interface ExamSession {
  examConfig: ExamConfig
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
  timeRemaining: number
}

export interface ExamResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  passingScore: number
  passed: boolean
  duration: number
  incorrectQuestions: QuestionWithChoices[]
}
