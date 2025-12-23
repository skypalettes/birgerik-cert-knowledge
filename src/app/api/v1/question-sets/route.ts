import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import {
  getQuestionSets,
  createQuestionSet,
} from '@/lib/database/question-sets'
import { unstable_cache } from 'next/cache'

// キャッシュ設定（60秒）
const getCachedQuestionSets = unstable_cache(
  async () => {
    return await getQuestionSets()
  },
  ['question-sets-list'],
  {
    revalidate: 60,
    tags: ['question-sets']
  }
)

/**
 * GET /api/v1/question-sets
 * すべての問題集を取得
 */
export const GET = withAuth(async () => {
  try {
    const questionSets = await getCachedQuestionSets()
    return successResponse(questionSets)
  } catch (error) {
    console.error('Get question sets error:', error)
    return errorResponse('問題集一覧の取得に失敗しました', 500)
  }
})

/**
 * POST /api/v1/question-sets
 * 新しい問題集を作成
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const result = await createQuestionSet(body)

    if (!result.success) {
      return errorResponse(result.error || '問題集の作成に失敗しました', 400)
    }

    return successResponse(result.data, 201)
  } catch (error) {
    console.error('Create question set error:', error)
    return errorResponse('問題集の作成に失敗しました', 500)
  }
})
