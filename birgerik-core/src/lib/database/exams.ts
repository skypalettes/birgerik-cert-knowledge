import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { handleSupabaseError } from '@/lib/errors'
import { examSchema, updateExamSchema } from '@/lib/validations/exam'
import type { DatabaseResult } from './types'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getExams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications (id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw handleSupabaseError(error)
  return data
}

export async function getExam(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications (id, name)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw handleSupabaseError(error)
  return data
}

export async function getExamByQuestionSetId(questionSetId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select('id, question_set_id, question_count, time_limit_minutes, passing_score')
    .eq('question_set_id', questionSetId)
    .single()

  if (error) return null
  return data
}

export async function createExam(input: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    const result = examSchema.safeParse(input)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', result.data.question_set_id)

    if (count !== null && result.data.question_count > count) {
      return { success: false, error: `出題数は問題数（${count}問）以下にしてください` }
    }

    const { data, error } = await adminClient
      .from('exams')
      .insert(result.data)
      .select('id')
      .single()

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('createExam error:', error)
    return { success: false, error: '試験の作成に失敗しました' }
  }
}

export async function updateExam(input: unknown): Promise<DatabaseResult> {
  try {
    const result = updateExamSchema.safeParse(input)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const { id, ...data } = result.data
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', data.question_set_id)

    if (count !== null && data.question_count > count) {
      return { success: false, error: `出題数は問題数（${count}問）以下にしてください` }
    }

    const { error } = await adminClient
      .from('exams')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('updateExam error:', error)
    return { success: false, error: '試験の更新に失敗しました' }
  }
}

export async function deleteExam(id: string): Promise<DatabaseResult> {
  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient.from('exams').delete().eq('id', id)
    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('deleteExam error:', error)
    return { success: false, error: '試験の削除に失敗しました' }
  }
}
