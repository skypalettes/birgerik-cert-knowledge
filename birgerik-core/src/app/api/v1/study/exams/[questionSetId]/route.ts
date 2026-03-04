import { NextRequest, NextResponse } from 'next/server'
import { successResponse, notFoundResponse } from '@/lib/api/response'
import { getExamByQuestionSetId } from '@/lib/database/exams'

type Params = { questionSetId: string }

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> }
): Promise<NextResponse> {
  const { questionSetId } = await context.params
  const exam = await getExamByQuestionSetId(questionSetId)
  if (!exam) return notFoundResponse('試験設定が見つかりません') as NextResponse
  return successResponse({ exam }) as NextResponse
}
