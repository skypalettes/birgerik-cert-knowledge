import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse } from '@/lib/api/response'

export const GET = withAuth(async (request: NextRequest) => {
  const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth/jwt')
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  const user = await verifyToken(token!)
  return successResponse({ user }) as NextResponse
})
