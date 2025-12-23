import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { getQuestionSetDetail } from '@/lib/database/study'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/study/question-sets/[id]
 * 学習用：問題集の詳細を取得（問題数を含む）
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const getCachedQuestionSetDetail = unstable_cache(
      async (setId: string) => {
        return await getQuestionSetDetail(setId)
      },
      [`study-question-set-${id}`],
      {
        revalidate: 60,
        tags: [`question-set-${id}`, 'question-sets']
      }
    )

    const result = await getCachedQuestionSetDetail(id)

    if (result.error) {
      if (result.error.includes('見つかりません')) {
        return notFoundResponse(result.error)
      }
      return errorResponse(result.error, 500)
    }

    return successResponse({ question_set: result.data })
  } catch (error) {
    console.error('Get question set detail error:', error)
    return errorResponse('問題集の取得に失敗しました', 500)
  }
})
