'use server'

import { revalidatePath } from 'next/cache'
import {
  questionSetFormSchema,
  type QuestionSetFormInput,
} from '@/lib/validations/question-set'
import {
  getQuestionSets as dbGetQuestionSets,
  getQuestionSet as dbGetQuestionSet,
  createQuestionSet as dbCreateQuestionSet,
  updateQuestionSet as dbUpdateQuestionSet,
  deleteQuestionSet as dbDeleteQuestionSet,
} from '@/lib/database/question-sets'
import { getCertificationsForSelect as dbGetCertificationsForSelect } from '@/lib/database/certifications'

// アクション結果の型定義
export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * 問題集を作成
 */
export async function createQuestionSet(
  formData: QuestionSetFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // バリデーション
    const result = questionSetFormSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    // lib/database の関数を呼び出し
    const dbResult = await dbCreateQuestionSet(result.data)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return dbResult
  } catch (error) {
    console.error('Error creating question set:', error)
    return {
      success: false,
      error: '問題集の作成に失敗しました',
    }
  }
}

/**
 * 問題集を更新
 */
export async function updateQuestionSet(
  id: string,
  formData: QuestionSetFormInput
): Promise<ActionResult> {
  try {
    // descriptionの空文字をnullに変換
    const input = {
      ...formData,
      description: formData.description.trim() === '' ? null : formData.description,
    }

    // lib/database の関数を呼び出し
    const dbResult = await dbUpdateQuestionSet(id, input)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return dbResult
  } catch (error) {
    console.error('Error updating question set:', error)
    return {
      success: false,
      error: '問題集の更新に失敗しました',
    }
  }
}

/**
 * 問題集を削除
 */
export async function deleteQuestionSet(
  id: string
): Promise<ActionResult> {
  try {
    // lib/database の関数を呼び出し
    const dbResult = await dbDeleteQuestionSet(id)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return dbResult
  } catch (error) {
    console.error('Error deleting question set:', error)
    return {
      success: false,
      error: '問題集の削除に失敗しました',
    }
  }
}

/**
 * すべての問題集を取得（資格情報と問題数を含む）
 */
export async function getQuestionSets() {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestionSets()
  } catch (error) {
    console.error('Error fetching question sets:', error)
    throw error
  }
}

/**
 * 特定の問題集を取得
 */
export async function getQuestionSet(id: string) {
  try {
    // lib/database の関数を呼び出し
    return await dbGetQuestionSet(id)
  } catch (error) {
    console.error('Error fetching question set:', error)
    throw error
  }
}

/**
 * すべての資格を取得（ドロップダウン用）
 */
export async function getCertificationsForSelect() {
  try {
    // lib/database の関数を呼び出し
    return await dbGetCertificationsForSelect()
  } catch (error) {
    console.error('Error fetching certifications:', error)
    throw error
  }
}