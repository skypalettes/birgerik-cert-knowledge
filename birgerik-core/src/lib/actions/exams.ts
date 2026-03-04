'use server'

import { revalidatePath } from 'next/cache'
import { examFormSchema, type ExamFormInput } from '@/lib/validations/exam'
import {
  getExams as dbGetExams,
  createExam as dbCreateExam,
  updateExam as dbUpdateExam,
  deleteExam as dbDeleteExam,
} from '@/lib/database/exams'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getExams() {
  return await dbGetExams()
}

export async function createExam(formData: ExamFormInput): Promise<ActionResult<{ id: string }>> {
  try {
    const result = examFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbCreateExam(result.data)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/exams')
    return dbResult
  } catch (error) {
    console.error('Error creating exam:', error)
    return { success: false, error: '試験の作成に失敗しました' }
  }
}

export async function updateExam(id: string, formData: ExamFormInput): Promise<ActionResult> {
  try {
    const result = examFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbUpdateExam({ ...result.data, id })
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/exams')
    return dbResult
  } catch (error) {
    console.error('Error updating exam:', error)
    return { success: false, error: '試験の更新に失敗しました' }
  }
}

export async function deleteExam(id: string): Promise<ActionResult> {
  try {
    const dbResult = await dbDeleteExam(id)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/exams')
    return dbResult
  } catch (error) {
    console.error('Error deleting exam:', error)
    return { success: false, error: '試験の削除に失敗しました' }
  }
}
