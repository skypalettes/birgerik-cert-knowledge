import { createClient } from '@/lib/supabase/server'
import { questionSetFormSchema, updateQuestionSetSchema } from '@/lib/validations/question-set'
import { handleSupabaseError } from '@/lib/errors'
import type { Database } from '@/lib/types/database.types'

// 型定義
type QuestionSetInsert = Database['public']['Tables']['question_sets']['Insert']
type QuestionSetUpdate = Database['public']['Tables']['question_sets']['Update']

// 結果の型定義
export type DatabaseResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * すべての問題集を取得（資格情報と問題数を含む）
 */
export async function getQuestionSets() {
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
}

/**
 * 特定の問題集を取得
 */
export async function getQuestionSet(id: string) {
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
}

/**
 * すべての問題集を取得（ドロップダウン用）
 */
export async function getQuestionSetsForSelect() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_sets')
    .select(`
      id,
      name,
      certification:certifications (
        id,
        name
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    const appError = handleSupabaseError(error)
    throw appError
  }

  return data
}

/**
 * 問題集を作成
 */
export async function createQuestionSet(
  input: unknown
): Promise<DatabaseResult<{ id: string }>> {
  try {
    // バリデーション
    const result = questionSetFormSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
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
      } as QuestionSetInsert)
      .select('id')
      .single()

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

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
  input: unknown
): Promise<DatabaseResult> {
  try {
    // バリデーション
    const result = updateQuestionSetSchema.safeParse({
      id,
      ...(typeof input === 'object' && input !== null ? input : {}),
    })

    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
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
      } as QuestionSetUpdate)
      .eq('id', validatedData.id)

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

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
export async function deleteQuestionSet(id: string): Promise<DatabaseResult> {
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
