import { QuestionSetList } from './question-set-list'
import { getQuestionSets, getCertificationsForSelect } from './actions'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '問題集管理 - Birgerik Core',
  description: '問題集の登録・編集・削除',
}

export default async function QuestionSetsPage() {
  let questionSets
  let certifications
  let error = null

  try {
    [questionSets, certifications] = await Promise.all([
      getQuestionSets(),
      getCertificationsForSelect(),
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
          <h1 className="text-3xl font-bold text-gray-900">問題集管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            資格試験の問題集を登録・管理します
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <ErrorMessage
            title="エラーが発生しました"
            message={error}
          />
        )}

        {/* 問題集一覧 */}
        {!error && questionSets && certifications && (
          <QuestionSetList
            initialQuestionSets={questionSets}
            certifications={certifications}
          />
        )}
      </div>
    </div>
  )
}