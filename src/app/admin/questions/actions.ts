'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  questionFormSchema,
  updateQuestionSchema,
  type QuestionFormInput,
} from '@/lib/validations/question'
import { handleSupabaseError } from '@/lib/errors'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * 問題を作成（選択肢も含む）
 */
export async function createQuestion(
  formData: QuestionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // バリデーション（superRefineで複数選択のチェックも実行される）
    const result = questionFormSchema.safeParse(formData)

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

    // explanationが空文字の場合はnullに変換
    const explanation =
      validatedData.explanation.trim() === ''
        ? null
        : validatedData.explanation

    // 問題をデータベースに挿入
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        question_set_id: validatedData.question_set_id,
        question_text: validatedData.question_text,
        explanation,
        is_multiple_choice: validatedData.is_multiple_choice,
      })
      .select('id')
      .single()

    if (questionError) {
      const appError = handleSupabaseError(questionError)
      return {
        success: false,
        error: appError.message,
      }
    }

    // 選択肢を挿入
    const choicesData = validatedData.choices.map((choice, index) => ({
      question_id: questionData.id,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: index,
    }))

    const { error: choicesError } = await supabase
      .from('choices')
      .insert(choicesData)

    if (choicesError) {
      await supabase.from('questions').delete().eq('id', questionData.id)
      const appError = handleSupabaseError(choicesError)
      return {
        success: false,
        error: appError.message,
      }
    }

    revalidatePath('/admin/questions')

    return {
      success: true,
      data: { id: questionData.id },
    }
  } catch (error) {
    console.error('Error creating question:', error)
    return {
      success: false,
      error: '問題の作成に失敗しました',
    }
  }
}

/**
 * 問題を更新（選択肢も含む）
 */
export async function updateQuestion(
  id: string,
  formData: QuestionFormInput
): Promise<ActionResult> {
  try {
    const result = updateQuestionSchema.safeParse({
      id,
      ...formData,
      explanation:
        formData.explanation.trim() === '' ? null : formData.explanation,
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

    const { error: questionError } = await supabase
      .from('questions')
      .update({
        question_set_id: validatedData.question_set_id,
        question_text: validatedData.question_text,
        explanation: validatedData.explanation,
        is_multiple_choice: validatedData.is_multiple_choice,
      })
      .eq('id', validatedData.id)

    if (questionError) {
      const appError = handleSupabaseError(questionError)
      return {
        success: false,
        error: appError.message,
      }
    }

    const { error: deleteError } = await supabase
      .from('choices')
      .delete()
      .eq('question_id', validatedData.id)

    if (deleteError) {
      const appError = handleSupabaseError(deleteError)
      return {
        success: false,
        error: appError.message,
      }
    }

    const choicesData = validatedData.choices.map((choice, index) => ({
      question_id: validatedData.id,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: index,
    }))

    const { error: choicesError } = await supabase
      .from('choices')
      .insert(choicesData)

    if (choicesError) {
      const appError = handleSupabaseError(choicesError)
      return {
        success: false,
        error: appError.message,
      }
    }

    revalidatePath('/admin/questions')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating question:', error)
    return {
      success: false,
      error: '問題の更新に失敗しました',
    }
  }
}

/**
 * 問題を削除（選択肢も自動削除される: CASCADE）
 */
export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('questions').delete().eq('id', id)

    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message,
      }
    }

    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return {
      success: false,
      error: '問題の削除に失敗しました',
    }
  }
}

/**
 * すべての問題を取得
 */
export async function getQuestions() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_set:question_sets (
          id,
          name,
          certification:certifications (
            id,
            name
          )
        ),
        choices (
          id,
          choice_text,
          is_correct,
          order_index
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      const appError = handleSupabaseError(error)
      throw appError
    }

    const sortedData = data.map((question) => ({
      ...question,
      choices: question.choices?.sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0)
      ),
    }))

    return sortedData
  } catch (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
}

/**
 * 特定の問題を取得
 */
export async function getQuestion(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_set:question_sets (
          id,
          name,
          certification:certifications (
            id,
            name
          )
        ),
        choices (
          id,
          choice_text,
          is_correct,
          order_index
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      const appError = handleSupabaseError(error)
      throw appError
    }

    if (data.choices) {
      data.choices.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    }

    return data
  } catch (error) {
    console.error('Error fetching question:', error)
    throw error
  }
}

/**
 * すべての問題集を取得（ドロップダウン用）
 */
export async function getQuestionSetsForSelect() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('question_sets')
      .select(
        `
        id,
        name,
        certification:certifications (
          id,
          name
        )
      `
      )
      .order('name', { ascending: true })

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