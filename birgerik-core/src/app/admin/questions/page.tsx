import { QuestionList } from './question-list'
import { getQuestions, getQuestionSetsForSelect } from '@/lib/actions/questions'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '問題管理 - Birgerik Core',
}

export default async function QuestionsPage() {
  let questions
  let questionSets
  let error = null

  try {
    [questions, questionSets] = await Promise.all([
      getQuestions(),
      getQuestionSetsForSelect(),
    ])
  } catch (e) {
    console.error('Failed to fetch data:', e)
    error = 'データの読み込みに失敗しました'
  }

  return (
    <>
      {error && <ErrorMessage title="エラーが発生しました" message={error} />}
      {!error && questions && questionSets && (
        <QuestionList
          initialQuestions={questions as Parameters<typeof QuestionList>[0]['initialQuestions']}
          questionSets={questionSets as Parameters<typeof QuestionList>[0]['questionSets']}
        />
      )}
    </>
  )
}
