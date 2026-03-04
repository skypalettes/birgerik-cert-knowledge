'use server'

import { revalidatePath } from 'next/cache'
import { certificationFormSchema, type CertificationFormInput } from '@/lib/validations/certification'
import {
  getCertifications as dbGetCertifications,
  getCertification as dbGetCertification,
  createCertification as dbCreateCertification,
  updateCertification as dbUpdateCertification,
  deleteCertification as dbDeleteCertification,
  type CertificationWithCount,
} from '@/lib/database/certifications'

export type { CertificationWithCount }

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getCertifications(): Promise<CertificationWithCount[]> {
  return await dbGetCertifications()
}

export async function getCertification(id: string) {
  return await dbGetCertification(id)
}

export async function createCertification(
  formData: CertificationFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const result = certificationFormSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbCreateCertification(result.data)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/certifications')
    return dbResult
  } catch (error) {
    console.error('Error creating certification:', error)
    return { success: false, error: '資格の作成に失敗しました' }
  }
}

export async function updateCertification(
  id: string,
  formData: CertificationFormInput
): Promise<ActionResult> {
  try {
    const input = {
      ...formData,
      description: formData.description.trim() === '' ? null : formData.description,
    }
    const dbResult = await dbUpdateCertification(id, input)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/certifications')
    return dbResult
  } catch (error) {
    console.error('Error updating certification:', error)
    return { success: false, error: '資格の更新に失敗しました' }
  }
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  try {
    const dbResult = await dbDeleteCertification(id)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/certifications')
    return dbResult
  } catch (error) {
    console.error('Error deleting certification:', error)
    return { success: false, error: '資格の削除に失敗しました' }
  }
}
