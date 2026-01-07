'use server'

import { revalidatePath } from 'next/cache'
import {
  questionFormSchema,
  type QuestionFormInput,
} from '@/lib/validations/question'
import {
  getQuestions as dbGetQuestions,
  getQuestion as dbGetQuestion,
  createQuestion as dbCreateQuestion,
  updateQuestion as dbUpdateQuestion,
  deleteQuestion as dbDeleteQuestion,
} from '@/lib/database/questions'
import { getQuestionSetsForSelect as dbGetQuestionSetsForSelect } from '@/lib/database/question-sets'
import { getCertifications as dbGetCertifications } from '@/lib/database/certifications'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * 問題を作成（選択肢も含む）
 */
export async function createQuestion(
  formData: QuestionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // バリデーション（superRefineで複数選択のチェックも実行される）
    const result = questionFormSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    // lib/database の関数を呼び出し
    const dbResult = await dbCreateQuestion(result.data)

    if (!dbResult.success) {
      return dbResult
    }

    revalidatePath('/admin/questions')

    return dbResult
  } catch (error) {
    console.error('Error creating question:', error)
    return {
      success: false,
      error: '問題の作成に失敗しました',
    }
  }
}

/**
 * 問題を更新（選択肢も含む）
 */
export async function updateQuestion(
  id: string,
  formData: QuestionFormInput
): Promise<ActionResult> {
  try {
    // バリデーション（superRefineで複数選択のチェックも実行される）
    const result = questionFormSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    // lib/database の関数を呼び出し（questionSchemaのtransformで空文字→nullに変換される）
    const dbResult = await dbUpdateQuestion(id, result.data)

    if (!dbResult.success) {
      return dbResult
    }

    revalidatePath('/admin/questions')

    return dbResult
  } catch (error) {
    console.error('Error updating question:', error)
    return {
      success: false,
      error: '問題の更新に失敗しました',
    }
  }
}

/**
 * 問題を削除（選択肢も自動削除される: CASCADE）
 */
export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    // lib/database の関数を呼び出し
    const dbResult = await dbDeleteQuestion(id)

    if (!dbResult.success) {
      return dbResult
    }

    revalidatePath('/admin/questions')
    return dbResult
  } catch (error) {
    console.error('Error deleting question:', error)
    return {
      success: false,
      error: '問題の削除に失敗しました',
    }
  }
}

/**
 * すべての問題を取得
 */
export async function getQuestions() {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestions()
  } catch (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
}

/**
 * 特定の問題を取得
 */
export async function getQuestion(id: string) {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestion(id)
  } catch (error) {
    console.error('Error fetching question:', error)
    throw error
  }
}

/**
 * すべての問題集を取得（ドロップダウン用）
 */
export async function getQuestionSetsForSelect() {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestionSetsForSelect()
  } catch (error) {
    console.error('Error fetching question sets:', error)
    throw error
  }
}

/**
 * すべての資格を取得（ドロップダウン用）
 */
export async function getCertifications() {
  try {
    // lib/database の関数を呼び出し
    return await dbGetCertifications()
  } catch (error) {
    console.error('Error fetching certifications:', error)
    throw error
  }
}