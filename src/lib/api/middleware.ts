import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, type JWTPayload } from '@/lib/auth/jwt'

/**
 * API認証ミドルウェア
 * Authorizationヘッダーを検証し、ユーザー情報を返す
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Authorization header is missing or invalid' },
          { status: 401 }
        ),
      }
    }

    const user = await verifyToken(token)
    return { user }
  } catch {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }
}

/**
 * 認証が必要なAPIハンドラーをラップする
 */
export function withAuth<T = Record<string, never>>(
  handler: (request: NextRequest, context: { params: Promise<T> }, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const auth = await authenticateRequest(request)

    if ('error' in auth) {
      return auth.error
    }

    return handler(request, context, auth.user)
  }
}
