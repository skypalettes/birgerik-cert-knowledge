import { NextRequest, NextResponse } from 'next/server'
import { successResponse, notFoundResponse } from '@/lib/api/response'
import { getQuestionSetDetail } from '@/lib/database/study'

type Params = { id: string }

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> }
): Promise<NextResponse> {
  const { id } = await context.params
  const { data, error } = await getQuestionSetDetail(id)
  if (error || !data) return notFoundResponse(error || '問題集が見つかりません') as NextResponse
  return successResponse({ question_set: data }) as NextResponse
}
