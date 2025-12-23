/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/errors'

/**
 * 資格と関連する問題集の型定義
 */
export interface CertificationWithQuestionSets {
  id: string
  name: string
  description: string | null
  question_sets: {
    id: string
    name: string
    description: string | null
    question_count: number
  }[]
}

/**
 * 問題と選択肢の型定義
 */
export interface QuestionWithChoices {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: {
    id: string
    choice_text: string
    is_correct: boolean
    order_index: number | null
  }[]
}

/**
 * すべての資格と問題集を取得
 * 各問題集には問題数も含まれる
 */
export async function getCertificationsWithQuestionSets(): Promise<{
  data: CertificationWithQuestionSets[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // 資格を取得
    const { data: certifications, error: certError } = await supabase
      .from('certifications')
      .select('id, name, description')
      .order('name')

    if (certError) throw certError
    if (!certifications || certifications.length === 0) {
      return { data: [], error: null }
    }

    // 各資格の問題集を取得
    const certificationsWithSets: CertificationWithQuestionSets[] = await Promise.all(
      certifications.map(async (cert) => {
        // 問題集を取得
        const { data: questionSets, error: setsError } = await supabase
          .from('question_sets')
          .select('id, name, description')
          .eq('certification_id', cert.id)
          .order('name')

        if (setsError) throw setsError

        // 各問題集の問題数をカウント
        const questionSetsWithCount = await Promise.all(
          (questionSets || []).map(async (set) => {
            const { count, error: countError } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('question_set_id', set.id)

            if (countError) throw countError

            return {
              ...set,
              question_count: count || 0,
            }
          })
        )

        return {
          ...cert,
          question_sets: questionSetsWithCount,
        }
      })
    )

    // 問題集が0の資格は除外
    const filteredCertifications = certificationsWithSets.filter(
      (cert) => cert.question_sets.length > 0
    )

    return { data: filteredCertifications, error: null }
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error('Error fetching certifications:', appError)
    return {
      data: null,
      error: appError.message,
    }
  }
}

/**
 * 特定の問題集の詳細情報を取得
 */
export async function getQuestionSetDetail(questionSetId: string): Promise<{
  data: {
    id: string
    name: string
    description: string | null
    certification_name: string
    question_count: number
  } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // 問題集と資格名を取得
    const { data: questionSet, error: setError } = await supabase
      .from('question_sets')
      .select(`
        id,
        name,
        description,
        certifications (
          name
        )
      `)
      .eq('id', questionSetId)
      .single()

    if (setError) throw setError
    if (!questionSet) {
      return {
        data: null,
        error: '問題集が見つかりませんでした',
      }
    }

    // 問題数をカウント
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', questionSetId)

    if (countError) throw countError

    // 型アサーションで certifications を取得
    const certificationName = (questionSet as any).certifications?.name || '不明'

    return {
      data: {
        id: questionSet.id,
        name: questionSet.name,
        description: questionSet.description,
        certification_name: certificationName,
        question_count: count || 0,
      },
      error: null,
    }
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error('Error fetching question set detail:', appError)
    return {
      data: null,
      error: appError.message,
    }
  }
}

/**
 * 問題集の全問題を取得（選択肢含む）
 */
export async function getQuestionsWithChoices(
  questionSetId: string
): Promise<{
  data: QuestionWithChoices[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        explanation,
        is_multiple_choice,
        order_index,
        choices (
          id,
          choice_text,
          is_correct,
          order_index
        )
      `)
      .eq('question_set_id', questionSetId)
      .order('order_index', { ascending: true })

    if (error) throw error

    // データを適切な型に変換（nullをデフォルト値に変換）
    const questions: QuestionWithChoices[] =
      data?.map((question) => ({
        id: question.id,
        question_text: question.question_text,
        explanation: question.explanation,
        is_multiple_choice: question.is_multiple_choice ?? false,
        order_index: question.order_index,
        choices:
          question.choices
            ?.map((choice) => ({
              id: choice.id,
              choice_text: choice.choice_text,
              is_correct: choice.is_correct ?? false,
              order_index: choice.order_index,
            }))
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [],
      })) || []

    return { data: questions, error: null }
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error('Error fetching questions:', appError)
    return {
      data: null,
      error: appError.message,
    }
  }
}
