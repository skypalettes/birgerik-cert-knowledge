import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '7d'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] })
  if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload')
  }
  return { userId: payload.userId as string, email: payload.email as string }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
