import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/lib/database/questions'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/questions/[id]
 * 特定の問題を取得
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const getCachedQuestion = unstable_cache(
      async (questionId: string) => {
        return await getQuestion(questionId)
      },
      [`question-${id}`],
      {
        revalidate: 60,
        tags: [`question-${id}`, 'questions']
      }
    )

    const question = await getCachedQuestion(id)

    if (!question) {
      return notFoundResponse('問題が見つかりません')
    }

    return successResponse(question)
  } catch (error) {
    console.error('Get question error:', error)
    return errorResponse('問題の取得に失敗しました', 500)
  }
})

/**
 * PUT /api/v1/questions/[id]
 * 問題を更新
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateQuestion(id, body)

    if (!result.success) {
      return errorResponse(result.error || '問題の更新に失敗しました', 400)
    }

    return successResponse({ message: '問題を更新しました' })
  } catch (error) {
    console.error('Update question error:', error)
    return errorResponse('問題の更新に失敗しました', 500)
  }
})

/**
 * DELETE /api/v1/questions/[id]
 * 問題を削除
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const result = await deleteQuestion(id)

    if (!result.success) {
      return errorResponse(result.error || '問題の削除に失敗しました', 400)
    }

    return successResponse({ message: '問題を削除しました' })
  } catch (error) {
    console.error('Delete question error:', error)
    return errorResponse('問題の削除に失敗しました', 500)
  }
})
