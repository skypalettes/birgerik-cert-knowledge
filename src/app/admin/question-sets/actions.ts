'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  questionSetFormSchema,
  updateQuestionSetSchema,
  type QuestionSetFormInput,
} from '@/lib/validations/question-set'
import { handleSupabaseError } from '@/lib/errors'

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

    const validatedData = result.data
    const supabase = await createClient()

    // descriptionが空文字の場合はnullに変換
    const description = validatedData.description.trim() === '' 
      ? null 
      : validatedData.description

    // データベースに挿入
    const { data, error } = await supabase
      .from('question_sets')
      .insert({
        name: validatedData.name,
        description,
        certification_id: validatedData.certification_id,
      })
      .select('id')
      .single()

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return {
      success: true,
      data: { id: data.id },
    }
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
    // バリデーション
    const result = updateQuestionSetSchema.safeParse({
      id,
      ...formData,
      description: formData.description.trim() === '' ? null : formData.description,
    })
    
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    const validatedData = result.data
    const supabase = await createClient()

    // データベースを更新
    const { error } = await supabase
      .from('question_sets')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        certification_id: validatedData.certification_id,
      })
      .eq('id', validatedData.id)

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return {
      success: true,
    }
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
    const supabase = await createClient()

    // 関連する問題があるか確認
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', id)

    if (countError) {
      const appError = handleSupabaseError(countError)
      return {
        success: false,
        error: appError.message,
      }
    }

    // 問題が存在する場合は削除不可
    if (count && count > 0) {
      return {
        success: false,
        error: `この問題集には${count}件の問題が紐付いています。先に問題を削除してください。`,
      }
    }

    // データベースから削除
    const { error } = await supabase
      .from('question_sets')
      .delete()
      .eq('id', id)

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

    // キャッシュを再検証
    revalidatePath('/admin/question-sets')

    return {
      success: true,
    }
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('question_sets')
      .select(`
        *,
        certification:certifications (
          id,
          name
        ),
        questions (count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      const appError = handleSupabaseError(error)
      throw appError
    }

    return data
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('question_sets')
      .select(`
        *,
        certification:certifications (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      const appError = handleSupabaseError(error)
      throw appError
    }

    return data
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('certifications')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      const appError = handleSupabaseError(error)
      throw appError
    }

    return data
  } catch (error) {
    console.error('Error fetching certifications:', error)
    throw error
  }
}