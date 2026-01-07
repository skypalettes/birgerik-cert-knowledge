import { QuestionList } from './question-list'
import { getQuestions, getQuestionSetsForSelect } from './actions'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '問題管理 - Birgerik Core',
  description: '問題の登録・編集・削除',
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">問題管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            試験問題を登録・管理します
          </p>
        </div>

        {/* エラー表示 */}
        {error && <ErrorMessage title="エラーが発生しました" message={error} />}

        {/* 問題一覧 */}
        {!error && questions && questionSets && (
          <QuestionList
            initialQuestions={questions}
            questionSets={questionSets}
          />
        )}
      </div>
    </div>
  )
}