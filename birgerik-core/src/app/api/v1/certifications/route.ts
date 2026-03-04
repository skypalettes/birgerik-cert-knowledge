import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertifications, createCertification } from '@/lib/database/certifications'

export const GET = withAuth(async () => {
  const certifications = await getCertifications()
  return successResponse({ certifications }) as NextResponse
})

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}))
  const result = await createCertification(body)
  if (!result.success) return errorResponse(result.error || '作成に失敗しました') as NextResponse
  return successResponse(result.data, 201) as NextResponse
})
