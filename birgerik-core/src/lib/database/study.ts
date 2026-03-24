/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/errors'
import type {
  CertificationWithQuestionSets,
  QuestionWithChoices,
} from '@birgerik/types'

export async function getCertificationsWithQuestionSets(): Promise<{
  data: CertificationWithQuestionSets[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data: certsWithSets, error: certError } = await supabase
      .from('certifications')
      .select(`
        id, name, description,
        question_sets (
          id, name, description, is_active,
          questions (count),
          exams (count)
        )
      `)
      .order('name')

    if (certError) throw certError
    if (!certsWithSets || certsWithSets.length === 0) return { data: [], error: null }

    const certificationsWithSets: CertificationWithQuestionSets[] = (certsWithSets as any[])
      .map((cert) => ({
        id: cert.id,
        name: cert.name,
        description: cert.description,
        question_sets: (cert.question_sets || [])
          .filter((qs: any) => qs.is_active)
          .map((qs: any) => ({
            id: qs.id,
            name: qs.name,
            description: qs.description,
            question_count: qs.questions?.[0]?.count || 0,
            is_active: qs.is_active,
            has_exam: (qs.exams?.[0]?.count || 0) > 0,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name)),
      }))
      .filter((cert) => cert.question_sets.length > 0)

    return { data: certificationsWithSets, error: null }
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error('Error fetching certifications:', appError)
    return { data: null, error: appError.message }
  }
}

export async function getQuestionSetDetail(questionSetId: string) {
  try {
    const supabase = await createClient()

    const { data: questionSet, error: setError } = await supabase
      .from('question_sets')
      .select('id, name, description, is_active, certifications (name)')
      .eq('id', questionSetId)
      .single()

    if (setError) throw setError
    if (!questionSet) return { data: null, error: '問題集が見つかりませんでした' }

    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', questionSetId)

    if (countError) throw countError

    const certificationName = (questionSet as any).certifications?.name || '不明'

    return {
      data: {
        id: questionSet.id,
        name: questionSet.name,
        description: questionSet.description,
        certification_name: certificationName,
        question_count: count || 0,
        is_active: questionSet.is_active,
      },
      error: null,
    }
  } catch (error) {
    const appError = handleSupabaseError(error)
    return { data: null, error: appError.message }
  }
}

export async function getQuestionsWithChoices(questionSetId: string): Promise<{
  data: QuestionWithChoices[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('questions')
      .select(`
        id, question_text, explanation, is_multiple_choice, order_index,
        choices (id, choice_text, is_correct, order_index)
      `)
      .eq('question_set_id', questionSetId)
      .order('order_index', { ascending: true })

    if (error) throw error

    const questions: QuestionWithChoices[] = data?.map((question) => ({
      id: question.id,
      question_text: question.question_text,
      explanation: question.explanation,
      is_multiple_choice: question.is_multiple_choice ?? false,
      order_index: question.order_index,
      choices: question.choices
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
    return { data: null, error: appError.message }
  }
}
