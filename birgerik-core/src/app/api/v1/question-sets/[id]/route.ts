import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getQuestionSet,
  updateQuestionSet,
  toggleQuestionSetActive,
  deleteQuestionSet,
} from '@/lib/database/question-sets'

type Params = { id: string }

export const GET = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const questionSet = await getQuestionSet(params.id)
  if (!questionSet) return notFoundResponse('問題集が見つかりません') as NextResponse
  return successResponse({ question_set: questionSet }) as NextResponse
})

export const PUT = withAuth<Params>(async (request: NextRequest, params: Params) => {
  const body = await request.json().catch(() => ({}))
  // is_activeのみの更新を検知
  if (Object.keys(body).length === 1 && 'is_active' in body) {
    const result = await toggleQuestionSetActive(params.id, body.is_active)
    if (!result.success) return errorResponse(result.error || '更新に失敗しました') as NextResponse
    return successResponse(null) as NextResponse
  }
  const result = await updateQuestionSet(params.id, body)
  if (!result.success) return errorResponse(result.error || '更新に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})

export const DELETE = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const result = await deleteQuestionSet(params.id)
  if (!result.success) return errorResponse(result.error || '削除に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})
