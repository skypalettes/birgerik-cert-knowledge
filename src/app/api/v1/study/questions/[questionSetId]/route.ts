import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { getQuestionsWithChoices } from '@/lib/database/study'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/study/questions/[questionSetId]
 * 学習用：問題集の問題一覧を取得（選択肢を含む）
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ questionSetId: string }> }
) => {
  try {
    const { questionSetId } = await params

    const getCachedQuestionsWithChoices = unstable_cache(
      async (setId: string) => {
        return await getQuestionsWithChoices(setId)
      },
      [`study-questions-${questionSetId}`],
      {
        revalidate: 60,
        tags: [`question-set-${questionSetId}`, 'questions']
      }
    )

    const result = await getCachedQuestionsWithChoices(questionSetId)

    if (result.error) {
      if (result.error.includes('見つかりません')) {
        return notFoundResponse(result.error)
      }
      return errorResponse(result.error, 500)
    }

    return successResponse({ questions: result.data })
  } catch (error) {
    console.error('Get questions with choices error:', error)
    return errorResponse('問題一覧の取得に失敗しました', 500)
  }
})
