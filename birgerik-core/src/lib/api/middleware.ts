import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { unauthorizedResponse, serverErrorResponse } from './response'
import type { JWTPayload } from '@/lib/auth/jwt'

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  if (!token) return unauthorizedResponse('認証トークンが必要です')
  try {
    const user = await verifyToken(token)
    return { user }
  } catch {
    return unauthorizedResponse('無効なトークンです')
  }
}

export function withAuth<T extends Record<string, string> = Record<string, string>>(
  handler: (request: NextRequest, params: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Promise<T> }): Promise<NextResponse> => {
    const result = await authenticateRequest(request)
    if (result instanceof NextResponse) return result
    try {
      const params = await context.params
      return await handler(request, params)
    } catch (error) {
      console.error('API Error:', error)
      return serverErrorResponse('サーバーエラーが発生しました')
    }
  }
}
