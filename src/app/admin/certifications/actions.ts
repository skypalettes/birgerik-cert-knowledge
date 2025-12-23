'use server'

import { revalidatePath } from 'next/cache'
import {
  certificationFormSchema,
  type CertificationFormInput,
} from '@/lib/validations/certification'
import {
  getCertifications as dbGetCertifications,
  getCertification as dbGetCertification,
  createCertification as dbCreateCertification,
  updateCertification as dbUpdateCertification,
  deleteCertification as dbDeleteCertification,
  type CertificationWithCount,
} from '@/lib/database/certifications'

// 型を再エクスポート
export type { CertificationWithCount }

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
  formData: CertificationFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // バリデーション（safeParse使用）
    const result = certificationFormSchema.safeParse(formData)

    if (!result.success) {
      // Zodのエラーをフィールドエラー形式に変換
      const fieldErrors = result.error.flatten().fieldErrors
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: fieldErrors as Record<string, string[]>,
      }
    }

    // lib/database の関数を呼び出し
    const dbResult = await dbCreateCertification(result.data)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/certifications')

    return dbResult
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
  formData: CertificationFormInput
): Promise<ActionResult> {
  try {
    // descriptionの空文字をnullに変換
    const input = {
      ...formData,
      description: formData.description.trim() === '' ? null : formData.description,
    }

    // lib/database の関数を呼び出し
    const dbResult = await dbUpdateCertification(id, input)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/certifications')

    return dbResult
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
    // lib/database の関数を呼び出し
    const dbResult = await dbDeleteCertification(id)

    if (!dbResult.success) {
      return dbResult
    }

    // キャッシュを再検証
    revalidatePath('/admin/certifications')

    return dbResult
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
export async function getCertifications(): Promise<CertificationWithCount[]> {
  try {
    // lib/database の関数を呼び出し
    return await dbGetCertifications()
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
    // lib/database の関数を呼び出し
    return await dbGetCertification(id)
  } catch (error) {
    console.error('Error fetching certification:', error)
    throw error
  }
}