'use server'

import { revalidatePath } from 'next/cache'
import { questionFormSchema, type QuestionFormInput } from '@/lib/validations/question'
import {
  getQuestions as dbGetQuestions,
  createQuestion as dbCreateQuestion,
  updateQuestion as dbUpdateQuestion,
  deleteQuestion as dbDeleteQuestion,
} from '@/lib/database/questions'
import { getQuestionSetsForSelect as dbGetQuestionSetsForSelect } from '@/lib/database/question-sets'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getQuestions() {
  return await dbGetQuestions()
}

export async function getQuestionSetsForSelect() {
  return await dbGetQuestionSetsForSelect()
}

export async function createQuestion(formData: QuestionFormInput): Promise<ActionResult<{ id: string }>> {
  try {
    const result = questionFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbCreateQuestion(result.data)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/questions')
    return dbResult
  } catch (error) {
    console.error('Error creating question:', error)
    return { success: false, error: '問題の作成に失敗しました' }
  }
}

export async function updateQuestion(id: string, formData: QuestionFormInput): Promise<ActionResult> {
  try {
    const result = questionFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbUpdateQuestion(id, result.data)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/questions')
    return dbResult
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, error: '問題の更新に失敗しました' }
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const dbResult = await dbDeleteQuestion(id)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/questions')
    return dbResult
  } catch (error) {
    console.error('Error deleting question:', error)
    return { success: false, error: '問題の削除に失敗しました' }
  }
}
