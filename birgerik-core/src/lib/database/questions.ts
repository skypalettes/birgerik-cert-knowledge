import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { questionFormSchema, updateQuestionSchema } from '@/lib/validations/question'
import { handleSupabaseError } from '@/lib/errors'
import { formatMarkdownLint } from '@/lib/utils/markdown'
import type { Database } from '@/lib/types/database.types'
import type { DatabaseResult } from './types'

type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']
type ChoiceInsert = Database['public']['Tables']['choices']['Insert']

export async function getQuestions(questionSetId?: string | null) {
  const supabase = await createClient()
  let query = supabase
    .from('questions')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications (id, name)
      ),
      choices (id, choice_text, is_correct, order_index)
    `)

  if (questionSetId) {
    query = query.eq('question_set_id', questionSetId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw handleSupabaseError(error)

  return data.map((question) => ({
    ...question,
    choices: question.choices?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
  }))
}

export async function getQuestion(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications (id, name)
      ),
      choices (id, choice_text, is_correct, order_index)
    `)
    .eq('id', id)
    .single()

  if (error) throw handleSupabaseError(error)
  if (data.choices) {
    data.choices.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  }
  return data
}

export async function createQuestion(input: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    const result = questionFormSchema.safeParse(input)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = createAdminClient()

    const formattedQuestionText = await formatMarkdownLint(validatedData.question_text)
    const explanation = validatedData.explanation.trim() === ''
      ? null
      : await formatMarkdownLint(validatedData.explanation)

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        question_set_id: validatedData.question_set_id,
        question_text: formattedQuestionText,
        explanation,
        is_multiple_choice: validatedData.is_multiple_choice,
      } as QuestionInsert)
      .select('id')
      .single()

    if (questionError) return { success: false, error: handleSupabaseError(questionError).message }

    const choicesData = validatedData.choices.map((choice, index) => ({
      question_id: questionData.id,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: index,
    } as ChoiceInsert))

    const { error: choicesError } = await supabase.from('choices').insert(choicesData)
    if (choicesError) {
      await supabase.from('questions').delete().eq('id', questionData.id)
      return { success: false, error: handleSupabaseError(choicesError).message }
    }

    return { success: true, data: { id: questionData.id } }
  } catch (error) {
    console.error('Error creating question:', error)
    return { success: false, error: '問題の作成に失敗しました' }
  }
}

export async function updateQuestion(id: string, input: unknown): Promise<DatabaseResult> {
  try {
    const dataToValidate = { id, ...(typeof input === 'object' && input !== null ? input : {}) }
    const result = updateQuestionSchema.safeParse(dataToValidate)
    if (!result.success) return { success: false, error: '入力内容に誤りがあります' }

    const validatedData = result.data
    const supabase = createAdminClient()

    const formattedQuestionText = await formatMarkdownLint(validatedData.question_text)
    const formattedExplanation = validatedData.explanation
      ? await formatMarkdownLint(validatedData.explanation)
      : null

    const { error: questionError } = await supabase
      .from('questions')
      .update({
        question_set_id: validatedData.question_set_id,
        question_text: formattedQuestionText,
        explanation: formattedExplanation,
        is_multiple_choice: validatedData.is_multiple_choice,
      } as QuestionUpdate)
      .eq('id', validatedData.id)

    if (questionError) return { success: false, error: handleSupabaseError(questionError).message }

    const { error: deleteError } = await supabase
      .from('choices')
      .delete()
      .eq('question_id', validatedData.id)

    if (deleteError) return { success: false, error: handleSupabaseError(deleteError).message }

    const choicesData = validatedData.choices.map((choice, index) => ({
      question_id: validatedData.id,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: index,
    } as ChoiceInsert))

    const { error: choicesError } = await supabase.from('choices').insert(choicesData)
    if (choicesError) return { success: false, error: handleSupabaseError(choicesError).message }

    return { success: true }
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, error: '問題の更新に失敗しました' }
  }
}

export async function deleteQuestion(id: string): Promise<DatabaseResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) return { success: false, error: handleSupabaseError(error).message }
    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return { success: false, error: '問題の削除に失敗しました' }
  }
}
