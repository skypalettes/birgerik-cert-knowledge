import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import {
  getQuestions,
  createQuestion,
} from '@/lib/database/questions'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/questions?question_set_id=xxx
 * 問題を取得（問題集IDでフィルタリング可能）
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const questionSetId = searchParams.get('question_set_id')

    const getCachedQuestions = unstable_cache(
      async (setId: string | null) => {
        return await getQuestions(setId)
      },
      [`questions-${questionSetId || 'all'}`],
      {
        revalidate: 60,
        tags: ['questions', questionSetId ? `question-set-${questionSetId}` : ''].filter(Boolean)
      }
    )

    const questions = await getCachedQuestions(questionSetId)
    return successResponse(questions)
  } catch (error) {
    console.error('Get questions error:', error)
    return errorResponse('問題一覧の取得に失敗しました', 500)
  }
})

/**
 * POST /api/v1/questions
 * 新しい問題を作成
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const result = await createQuestion(body)

    if (!result.success) {
      return errorResponse(result.error || '問題の作成に失敗しました', 400)
    }

    return successResponse(result.data, 201)
  } catch (error) {
    console.error('Create question error:', error)
    return errorResponse('問題の作成に失敗しました', 500)
  }
})
