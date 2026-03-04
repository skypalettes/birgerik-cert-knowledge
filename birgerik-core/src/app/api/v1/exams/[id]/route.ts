import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { getExam, updateExam, deleteExam } from '@/lib/database/exams'

type Params = { id: string }

export const GET = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const exam = await getExam(params.id)
  if (!exam) return notFoundResponse('試験設定が見つかりません') as NextResponse
  return successResponse({ exam }) as NextResponse
})

export const PUT = withAuth<Params>(async (request: NextRequest, params: Params) => {
  const body = await request.json().catch(() => ({}))
  const result = await updateExam({ ...body, id: params.id })
  if (!result.success) return errorResponse(result.error || '更新に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})

export const DELETE = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const result = await deleteExam(params.id)
  if (!result.success) return errorResponse(result.error || '削除に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})
