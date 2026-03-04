import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/lib/database/questions'

type Params = { id: string }

export const GET = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const question = await getQuestion(params.id)
  if (!question) return notFoundResponse('問題が見つかりません') as NextResponse
  return successResponse({ question }) as NextResponse
})

export const PUT = withAuth<Params>(async (request: NextRequest, params: Params) => {
  const body = await request.json().catch(() => ({}))
  const result = await updateQuestion(params.id, body)
  if (!result.success) return errorResponse(result.error || '更新に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})

export const DELETE = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const result = await deleteQuestion(params.id)
  if (!result.success) return errorResponse(result.error || '削除に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})
