import { ExamList } from './exam-list'
import { getExams } from '@/lib/actions/exams'
import { getQuestionSetsForSelect } from '@/lib/database/question-sets'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '試験管理 - Birgerik Core',
}

export default async function ExamsPage() {
  let exams
  let questionSets
  let error = null

  try {
    [exams, questionSets] = await Promise.all([
      getExams(),
      getQuestionSetsForSelect(),
    ])
  } catch (e) {
    console.error('Failed to fetch data:', e)
    error = 'データの読み込みに失敗しました'
  }

  return (
    <>
      {error && <ErrorMessage title="エラーが発生しました" message={error} />}
      {!error && exams && questionSets && (
        <ExamList
          initialExams={exams as Parameters<typeof ExamList>[0]['initialExams']}
          questionSets={questionSets as Parameters<typeof ExamList>[0]['questionSets']}
        />
      )}
    </>
  )
}
