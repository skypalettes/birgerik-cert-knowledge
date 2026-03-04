import { QuestionSetList } from './question-set-list'
import { getQuestionSets } from '@/lib/actions/question-sets'
import { getCertificationsForSelect } from '@/lib/database/certifications'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '問題集管理 - Birgerik Core',
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
    <>
      {error && <ErrorMessage title="エラーが発生しました" message={error} />}
      {!error && questionSets && certifications && (
        <QuestionSetList
          initialQuestionSets={questionSets as Parameters<typeof QuestionSetList>[0]['initialQuestionSets']}
          certifications={certifications}
        />
      )}
    </>
  )
}
