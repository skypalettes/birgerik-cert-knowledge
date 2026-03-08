import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { certificationFormSchema, updateCertificationSchema } from '@/lib/validations/certification'
import { handleSupabaseError } from '@/lib/errors'
import type { Database } from '@/lib/types/database.types'
import type { DatabaseResult } from './types'

type Certification = Database['public']['Tables']['certifications']['Row']
type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
type CertificationUpdate = Database['public']['Tables']['certifications']['Update']

export interface CertificationWithCount extends Certification {
  question_sets: { count: number }[] | null
}

export async function getCertifications(): Promise<CertificationWithCount[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certifications')
    .select('*, question_sets (count)')
    .order('created_at', { ascending: false })

  if (error) throw handleSupabaseError(error)
  return data as CertificationWithCount[]
}

export async function getCertification(id: string): Promise<Certification | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw handleSupabaseError(error)
  return data
}

export async function getCertificationsForSelect(): Promise<Pick<Certification, 'id' | 'name'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certifications')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw handleSupabaseError(error)
  return data
}

export async function createCertification(input: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    const result = certificationFormSchema.safeParse(input)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = createAdminClient()
    const description = validatedData.description.trim() === '' ? null : validatedData.description

    const { data, error } = await supabase
      .from('certifications')
      .insert({ name: validatedData.name, description } as CertificationInsert)
      .select('id')
      .single()

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Error creating certification:', error)
    return { success: false, error: '資格の作成に失敗しました' }
  }
}

export async function updateCertification(id: string, input: unknown): Promise<DatabaseResult> {
  try {
    const result = updateCertificationSchema.safeParse({
      id,
      ...(typeof input === 'object' && input !== null ? input : {}),
    })
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('certifications')
      .update({ name: validatedData.name, description: validatedData.description } as CertificationUpdate)
      .eq('id', validatedData.id)

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error updating certification:', error)
    return { success: false, error: '資格の更新に失敗しました' }
  }
}

export async function deleteCertification(id: string): Promise<DatabaseResult> {
  try {
    const supabase = createAdminClient()
    const { count, error: countError } = await supabase
      .from('question_sets')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', id)

    if (countError) return { success: false, error: handleSupabaseError(countError).message }
    if (count && count > 0) {
      return { success: false, error: `この資格には${count}件の問題集が紐付いています。先に問題集を削除してください。` }
    }

    const { error } = await supabase.from('certifications').delete().eq('id', id)
    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error deleting certification:', error)
    return { success: false, error: '資格の削除に失敗しました' }
  }
}
