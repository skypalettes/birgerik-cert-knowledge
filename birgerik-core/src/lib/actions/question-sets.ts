'use server'

import { revalidatePath } from 'next/cache'
import { questionSetFormSchema, type QuestionSetFormInput } from '@/lib/validations/question-set'
import {
  getQuestionSets as dbGetQuestionSets,
  getQuestionSetsForSelect as dbGetQuestionSetsForSelect,
  createQuestionSet as dbCreateQuestionSet,
  updateQuestionSet as dbUpdateQuestionSet,
  toggleQuestionSetActive as dbToggleActive,
  deleteQuestionSet as dbDeleteQuestionSet,
} from '@/lib/database/question-sets'
import { getCertificationsForSelect } from '@/lib/database/certifications'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getQuestionSets() {
  return await dbGetQuestionSets()
}

export async function getQuestionSetsForSelect() {
  return await dbGetQuestionSetsForSelect()
}

export async function getCertificationsForSelect2() {
  return await getCertificationsForSelect()
}

export async function createQuestionSet(formData: QuestionSetFormInput): Promise<ActionResult<{ id: string }>> {
  try {
    const result = questionSetFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbCreateQuestionSet(result.data)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/question-sets')
    return dbResult
  } catch (error) {
    console.error('Error creating question set:', error)
    return { success: false, error: '問題集の作成に失敗しました' }
  }
}

export async function updateQuestionSet(id: string, formData: QuestionSetFormInput): Promise<ActionResult> {
  try {
    const dbResult = await dbUpdateQuestionSet(id, formData)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/question-sets')
    return dbResult
  } catch (error) {
    console.error('Error updating question set:', error)
    return { success: false, error: '問題集の更新に失敗しました' }
  }
}

export async function toggleQuestionSetActive(id: string, is_active: boolean): Promise<ActionResult> {
  try {
    const dbResult = await dbToggleActive(id, is_active)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/question-sets')
    return dbResult
  } catch (error) {
    console.error('Error toggling question set:', error)
    return { success: false, error: '問題集の更新に失敗しました' }
  }
}

export async function deleteQuestionSet(id: string): Promise<ActionResult> {
  try {
    const dbResult = await dbDeleteQuestionSet(id)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/question-sets')
    return dbResult
  } catch (error) {
    console.error('Error deleting question set:', error)
    return { success: false, error: '問題集の削除に失敗しました' }
  }
}
