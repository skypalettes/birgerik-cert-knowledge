import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getQuestions, createQuestion } from '@/lib/database/questions'

export const GET = withAuth(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const questionSetId = searchParams.get('question_set_id')
  const { data: questions } = await getQuestions(questionSetId ? { questionSetIds: [questionSetId] } : undefined)
  return successResponse({ questions }) as NextResponse
})

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}))
  const result = await createQuestion(body)
  if (!result.success) return errorResponse(result.error || '作成に失敗しました') as NextResponse
  return successResponse(result.data, 201) as NextResponse
})
