import { createClient } from '@/lib/supabase/server'
import { questionFormSchema, updateQuestionSchema } from '@/lib/validations/question'
import { handleSupabaseError } from '@/lib/errors'
import { formatMarkdownLint } from '@/lib/utils/markdown'
import type { Database } from '@/lib/types/database.types'

// 型定義
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']
type ChoiceInsert = Database['public']['Tables']['choices']['Insert']

// 結果の型定義
export type DatabaseResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * すべての問題を取得（問題集情報、選択肢を含む）
 * @param questionSetId - オプション：問題集IDでフィルタリング
 */
export async function getQuestions(questionSetId?: string | null) {
  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select(`
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
    `)

  // 問題集IDでフィルタリング
  if (questionSetId) {
    query = query.eq('question_set_id', questionSetId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    const appError = handleSupabaseError(error)
    throw appError
  }

  // 選択肢をorder_indexでソート
  const sortedData = data.map((question) => ({
    ...question,
    choices: question.choices?.sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    ),
  }))

  return sortedData
}

/**
 * 特定の問題を取得（選択肢を含む）
 */
export async function getQuestion(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
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
    `)
    .eq('id', id)
    .single()

  if (error) {
    const appError = handleSupabaseError(error)
    throw appError
  }

  // 選択肢をorder_indexでソート
  if (data.choices) {
    data.choices.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  }

  return data
}

/**
 * 問題を作成（選択肢も含む）
 */
export async function createQuestion(
  input: unknown
): Promise<DatabaseResult<{ id: string }>> {
  try {
    // バリデーション（superRefineで複数選択のチェックも実行される）
    const result = questionFormSchema.safeParse(input)

    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
      }
    }

    const validatedData = result.data
    const supabase = await createClient()

    // markdownlintルールに準拠した整形を適用
    const formattedQuestionText = await formatMarkdownLint(
      validatedData.question_text
    )

    // explanationが空文字の場合はnullに変換、それ以外は整形
    const explanation =
      validatedData.explanation.trim() === ''
        ? null
        : await formatMarkdownLint(validatedData.explanation)

    // 問題をデータベースに挿入
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
    } as ChoiceInsert))

    const { error: choicesError } = await supabase
      .from('choices')
      .insert(choicesData)

    if (choicesError) {
      // 問題の挿入をロールバック
      await supabase.from('questions').delete().eq('id', questionData.id)
      const appError = handleSupabaseError(choicesError)
      return {
        success: false,
        error: appError.message,
      }
    }

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
  input: unknown
): Promise<DatabaseResult> {
  try {
    const dataToValidate = {
      id,
      ...(typeof input === 'object' && input !== null ? input : {}),
    }

    const result = updateQuestionSchema.safeParse(dataToValidate)

    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
      }
    }

    const validatedData = result.data
    const supabase = await createClient()

    // markdownlintルールに準拠した整形を適用
    const formattedQuestionText = await formatMarkdownLint(
      validatedData.question_text
    )

    // explanationが存在する場合は整形、nullの場合はそのまま
    const formattedExplanation = validatedData.explanation
      ? await formatMarkdownLint(validatedData.explanation)
      : null

    // 問題を更新
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        question_set_id: validatedData.question_set_id,
        question_text: formattedQuestionText,
        explanation: formattedExplanation,
        is_multiple_choice: validatedData.is_multiple_choice,
      } as QuestionUpdate)
      .eq('id', validatedData.id)

    if (questionError) {
      const appError = handleSupabaseError(questionError)
      return {
        success: false,
        error: appError.message,
      }
    }

    // 既存の選択肢を削除
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

    // 新しい選択肢を挿入
    const choicesData = validatedData.choices.map((choice, index) => ({
      question_id: validatedData.id,
      choice_text: choice.choice_text,
      is_correct: choice.is_correct,
      order_index: index,
    } as ChoiceInsert))

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
export async function deleteQuestion(id: string): Promise<DatabaseResult> {
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

    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return {
      success: false,
      error: '問題の削除に失敗しました',
    }
  }
}
