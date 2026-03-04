import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getQuestionsWithChoices } from '@/lib/database/study'

type Params = { questionSetId: string }

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> }
): Promise<NextResponse> {
  const { questionSetId } = await context.params
  const { data, error } = await getQuestionsWithChoices(questionSetId)
  if (error || !data) return errorResponse(error || 'データの取得に失敗しました', 500) as NextResponse
  return successResponse({ questions: data }) as NextResponse
}
