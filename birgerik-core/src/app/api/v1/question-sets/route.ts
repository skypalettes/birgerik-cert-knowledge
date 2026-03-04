import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getQuestionSets, createQuestionSet } from '@/lib/database/question-sets'

export const GET = withAuth(async () => {
  const questionSets = await getQuestionSets()
  return successResponse({ question_sets: questionSets }) as NextResponse
})

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}))
  const result = await createQuestionSet(body)
  if (!result.success) return errorResponse(result.error || '作成に失敗しました') as NextResponse
  return successResponse(result.data, 201) as NextResponse
})
