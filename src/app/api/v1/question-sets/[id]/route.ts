import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
} from '@/lib/database/question-sets'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/question-sets/[id]
 * 特定の問題集を取得
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const getCachedQuestionSet = unstable_cache(
      async (setId: string) => {
        return await getQuestionSet(setId)
      },
      [`question-set-${id}`],
      {
        revalidate: 60,
        tags: [`question-set-${id}`, 'question-sets']
      }
    )

    const questionSet = await getCachedQuestionSet(id)

    if (!questionSet) {
      return notFoundResponse('問題集が見つかりません')
    }

    return successResponse(questionSet)
  } catch (error) {
    console.error('Get question set error:', error)
    return errorResponse('問題集の取得に失敗しました', 500)
  }
})

/**
 * PUT /api/v1/question-sets/[id]
 * 問題集を更新
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateQuestionSet(id, body)

    if (!result.success) {
      return errorResponse(result.error || '問題集の更新に失敗しました', 400)
    }

    return successResponse({ message: '問題集を更新しました' })
  } catch (error) {
    console.error('Update question set error:', error)
    return errorResponse('問題集の更新に失敗しました', 500)
  }
})

/**
 * DELETE /api/v1/question-sets/[id]
 * 問題集を削除
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const result = await deleteQuestionSet(id)

    if (!result.success) {
      return errorResponse(result.error || '問題集の削除に失敗しました', 400)
    }

    return successResponse({ message: '問題集を削除しました' })
  } catch (error) {
    console.error('Delete question set error:', error)
    return errorResponse('問題集の削除に失敗しました', 500)
  }
})
