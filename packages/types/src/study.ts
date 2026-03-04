import type { QuestionWithChoices } from './api'

export interface UserAnswer {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
  answeredAt: Date
}

export interface StudySession {
  questionSetId: string
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
}

export interface StudyResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  incorrectQuestions: QuestionWithChoices[]
  duration: number
}
