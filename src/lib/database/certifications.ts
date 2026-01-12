import { createClient } from '@/lib/supabase/server'
import { certificationFormSchema, updateCertificationSchema } from '@/lib/validations/certification'
import { handleSupabaseError } from '@/lib/errors'
import type { Database } from '@/lib/types/database.types'

// 型定義
type Certification = Database['public']['Tables']['certifications']['Row']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type CertificationUpdate = Database['public']['Tables']['certifications']['Update']

// 問題集数を含む資格の型定義
export interface CertificationWithCount extends Certification {
  question_sets: { count: number }[] | null
}

// 結果の型定義
export type DatabaseResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * すべての資格を取得（問題集数を含む）
 */
export async function getCertifications(): Promise<CertificationWithCount[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .select(`
      *,
      question_sets (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    const appError = handleSupabaseError(error)
    throw appError
  }

  return data as CertificationWithCount[]
}

/**
 * 特定の資格を取得
 */
export async function getCertification(id: string): Promise<Certification | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    const appError = handleSupabaseError(error)
    throw appError
  }

  return data
}

/**
 * すべての資格を取得（ドロップダウン用）
 */
export async function getCertificationsForSelect(): Promise<Pick<Certification, 'id' | 'name'>[]> {
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
}

/**
 * 資格を作成
 */
export async function createCertification(
  input: unknown
): Promise<DatabaseResult<{ id: string }>> {
  try {
    // バリデーション
    const result = certificationFormSchema.safeParse(input)

    if (!result.success) {
      const _fieldErrors = result.error.flatten().fieldErrors
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
      .from('certifications')
      .insert({
        name: validatedData.name,
        description,
      } as CertificationInsert)
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
    console.error('Error creating certification:', error)
    return {
      success: false,
      error: '資格の作成に失敗しました',
    }
  }
}

/**
 * 資格を更新
 */
export async function updateCertification(
  id: string,
  input: unknown
): Promise<DatabaseResult> {
  try {
    // バリデーション
    const result = updateCertificationSchema.safeParse({
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
      .from('certifications')
      .update({
        name: validatedData.name,
        description: validatedData.description,
      } as CertificationUpdate)
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
    console.error('Error updating certification:', error)
    return {
      success: false,
      error: '資格の更新に失敗しました',
    }
  }
}

/**
 * 資格を削除
 */
export async function deleteCertification(id: string): Promise<DatabaseResult> {
  try {
    const supabase = await createClient()

    // 関連する問題集があるか確認
    const { count, error: countError } = await supabase
      .from('question_sets')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', id)

    if (countError) {
      const appError = handleSupabaseError(countError)
      return {
        success: false,
        error: appError.message,
      }
    }

    // 問題集が存在する場合は削除不可
    if (count && count > 0) {
      return {
        success: false,
        error: `この資格には${count}件の問題集が紐付いています。先に問題集を削除してください。`,
      }
    }

    // データベースから削除
    const { error } = await supabase
      .from('certifications')
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
    console.error('Error deleting certification:', error)
    return {
      success: false,
      error: '資格の削除に失敗しました',
    }
  }
}
