import { QuestionList } from './question-list'
import { getQuestions, getQuestionSetsForSelect } from '@/lib/actions/questions'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '問題管理 - Birgerik Core',
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ cert?: string; set?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const certId = params.cert || 'all'
  const setId = params.set || 'all'
  const searchText = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))

  let questionsResult
  let questionSets
  let error = null

  try {
    questionSets = await getQuestionSetsForSelect()

    // Resolve cert/set filter to questionSetIds for DB query
    type QS = { id: string; certification: { id: string } | null }
    let questionSetIds: string[] | undefined = undefined
    if (setId !== 'all') {
      questionSetIds = [setId]
    } else if (certId !== 'all') {
      questionSetIds = (questionSets as QS[])
        .filter((qs) => qs.certification?.id === certId)
        .map((qs) => qs.id)
    }

    questionsResult = await getQuestions({
      questionSetIds,
      searchText: searchText || null,
      page,
    })
  } catch (e) {
    console.error('Failed to fetch data:', e)
    error = 'データの読み込みに失敗しました'
  }

  return (
    <>
      {error && <ErrorMessage title="エラーが発生しました" message={error} />}
      {!error && questionsResult && questionSets && (
        <QuestionList
          initialQuestions={questionsResult.data as Parameters<typeof QuestionList>[0]['initialQuestions']}
          totalCount={questionsResult.count}
          page={questionsResult.page}
          pageSize={questionsResult.pageSize}
          questionSets={questionSets as Parameters<typeof QuestionList>[0]['questionSets']}
          currentCertId={certId}
          currentSetId={setId}
          currentSearch={searchText}
        />
      )}
    </>
  )
}
