import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/database/certifications'

type Params = { id: string }

export const GET = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const certification = await getCertification(params.id)
  if (!certification) return notFoundResponse('資格が見つかりません') as NextResponse
  return successResponse({ certification }) as NextResponse
})

export const PUT = withAuth<Params>(async (request: NextRequest, params: Params) => {
  const body = await request.json().catch(() => ({}))
  const result = await updateCertification(params.id, body)
  if (!result.success) return errorResponse(result.error || '更新に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})

export const DELETE = withAuth<Params>(async (_request: NextRequest, params: Params) => {
  const result = await deleteCertification(params.id)
  if (!result.success) return errorResponse(result.error || '削除に失敗しました') as NextResponse
  return successResponse(null) as NextResponse
})
