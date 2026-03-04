import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertificationsWithQuestionSets } from '@/lib/database/study'

export async function GET(): Promise<NextResponse> {
  const { data, error } = await getCertificationsWithQuestionSets()
  if (error || !data) return errorResponse(error || 'データの取得に失敗しました', 500) as NextResponse
  return successResponse({ certifications: data }) as NextResponse
}
