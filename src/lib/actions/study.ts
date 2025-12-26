'use server'

import {
  getCertificationsWithQuestionSets as dbGetCertificationsWithQuestionSets,
  getQuestionSetDetail as dbGetQuestionSetDetail,
  getQuestionsWithChoices as dbGetQuestionsWithChoices,
} from '@/lib/database/study'

import type {
  CertificationWithQuestionSets,
  QuestionWithChoices,
} from '@birgerik/types'

// 型を再エクスポート
export type { CertificationWithQuestionSets, QuestionWithChoices }

/**
 * すべての資格と問題集を取得
 * 各問題集には問題数も含まれる
 */
export async function getCertificationsWithQuestionSets(): Promise<{
  data: CertificationWithQuestionSets[] | null
  error: string | null
}> {
  try {
    // lib/database の関数を呼び出し
    return await dbGetCertificationsWithQuestionSets()
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }
}

/**
 * 特定の問題集の詳細情報を取得
 */
export async function getQuestionSetDetail(questionSetId: string): Promise<{
  data: {
    id: string
    name: string
    description: string | null
    certification_name: string
    question_count: number
  } | null
  error: string | null
}> {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestionSetDetail(questionSetId)
  } catch (error) {
    console.error('Error fetching question set detail:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }
}

/**
 * 問題集の全問題を取得（選択肢含む）
 */
export async function getQuestionsWithChoices(
  questionSetId: string
): Promise<{
  data: QuestionWithChoices[] | null
  error: string | null
}> {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestionsWithChoices(questionSetId)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    }
  }
}