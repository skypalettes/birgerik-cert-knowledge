import { createClient } from '@/lib/supabase/server'
import { questionSetFormSchema, updateQuestionSetSchema } from '@/lib/validations/question-set'
import { handleSupabaseError } from '@/lib/errors'
import type { Database } from '@/lib/types/database.types'
import type { DatabaseResult } from './types'

type QuestionSetInsert = Database['public']['Tables']['question_sets']['Insert']
type QuestionSetUpdate = Database['public']['Tables']['question_sets']['Update']

export async function getQuestionSets() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('question_sets')
    .select('*, certification:certifications (id, name), questions (count)')
    .order('created_at', { ascending: false })

  if (error) throw handleSupabaseError(error)
  return data
}

export async function getQuestionSet(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('question_sets')
    .select('*, certification:certifications (id, name)')
    .eq('id', id)
    .single()

  if (error) throw handleSupabaseError(error)
  return data
}

export async function getQuestionSetsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('question_sets')
    .select('id, name, certification:certifications (id, name)')
    .order('name', { ascending: true })

  if (error) throw handleSupabaseError(error)
  return data
}

export async function createQuestionSet(input: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    const result = questionSetFormSchema.safeParse(input)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = await createClient()
    const description = validatedData.description.trim() === '' ? null : validatedData.description

    const { data, error } = await supabase
      .from('question_sets')
      .insert({
        name: validatedData.name,
        description,
        certification_id: validatedData.certification_id,
        is_active: validatedData.is_active,
      } as QuestionSetInsert)
      .select('id')
      .single()

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Error creating question set:', error)
    return { success: false, error: '問題集の作成に失敗しました' }
  }
}

export async function updateQuestionSet(id: string, input: unknown): Promise<DatabaseResult> {
  try {
    const result = updateQuestionSetSchema.safeParse({
      id,
      ...(typeof input === 'object' && input !== null ? input : {}),
    })
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = await createClient()
    const { error } = await supabase
      .from('question_sets')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        certification_id: validatedData.certification_id,
        is_active: validatedData.is_active,
      } as QuestionSetUpdate)
      .eq('id', validatedData.id)

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error updating question set:', error)
    return { success: false, error: '問題集の更新に失敗しました' }
  }
}

export async function toggleQuestionSetActive(id: string, is_active: boolean): Promise<DatabaseResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('question_sets')
      .update({ is_active } as QuestionSetUpdate)
      .eq('id', id)

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error toggling question set active:', error)
    return { success: false, error: '問題集の更新に失敗しました' }
  }
}

export async function deleteQuestionSet(id: string): Promise<DatabaseResult> {
  try {
    const supabase = await createClient()
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', id)

    if (countError) return { success: false, error: handleSupabaseError(countError).message }
    if (count && count > 0) {
      return { success: false, error: `この問題集には${count}件の問題が紐付いています。先に問題を削除してください。` }
    }

    const { error } = await supabase.from('question_sets').delete().eq('id', id)
    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error deleting question set:', error)
    return { success: false, error: '問題集の削除に失敗しました' }
  }
}
