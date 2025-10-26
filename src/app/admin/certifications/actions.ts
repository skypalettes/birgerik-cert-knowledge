'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  certificationSchema,
  updateCertificationSchema,
  type CertificationFormData,
} from '@/lib/validations/certification'
import { handleSupabaseError } from '@/lib/errors'

// アクション結果の型定義
export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * 資格を作成
 */
export async function createCertification(
  formData: CertificationFormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // バリデーション（safeParse使用）
    const result = certificationSchema.safeParse(formData)
    
    if (!result.success) {
      // Zodのエラーをフィールドエラー形式に変換
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    const validatedData = result.data
    const supabase = await createClient()

    // データベースに挿入
    const { data, error } = await supabase
      .from('certifications')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
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
    revalidatePath('/admin/certifications')

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
  formData: CertificationFormData
): Promise<ActionResult> {
  try {
    // バリデーション（safeParse使用）
    const result = updateCertificationSchema.safeParse({
      id,
      ...formData,
    })
    
    if (!result.success) {
      // Zodのエラーをフィールドエラー形式に変換
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
      .from('certifications')
      .update({
        name: validatedData.name,
        description: validatedData.description,
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
    revalidatePath('/admin/certifications')

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
export async function deleteCertification(
  id: string
): Promise<ActionResult> {
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

    // キャッシュを再検証
    revalidatePath('/admin/certifications')

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

/**
 * すべての資格を取得
 */
export async function getCertifications() {
  try {
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

    return data
  } catch (error) {
    console.error('Error fetching certifications:', error)
    throw error
  }
}

/**
 * 特定の資格を取得
 */
export async function getCertification(id: string) {
  try {
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
  } catch (error) {
    console.error('Error fetching certification:', error)
    throw error
  }
}