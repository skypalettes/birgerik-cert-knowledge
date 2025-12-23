import { SignJWT, jwtVerify } from 'jose'

// JWT設定
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '7d' // 7日間有効

// JWTペイロードの型定義
export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * JWTトークンを生成
 */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error('Error signing JWT:', error)
    throw new Error('トークンの生成に失敗しました')
  }
}

/**
 * JWTトークンを検証
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // ペイロードの検証
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      throw new Error('Invalid token payload')
    }

    return {
      userId: payload.userId,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch (error) {
    console.error('Error verifying JWT:', error)
    throw new Error('無効なトークンです')
  }
}

/**
 * Authorizationヘッダーからトークンを抽出
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
