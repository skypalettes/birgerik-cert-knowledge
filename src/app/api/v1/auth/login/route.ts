import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/auth/jwt'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'
import { z } from 'zod'

// ログインリクエストのスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
})

/**
 * POST /api/v1/auth/login
 * メールアドレスとパスワードでログインし、JWTトークンを返す
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors)
    }

    const { email, password } = result.data

    // Supabaseで認証
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return errorResponse('メールアドレスまたはパスワードが正しくありません', 401)
    }

    // JWTトークンを生成
    const token = await signToken({
      userId: data.user.id,
      email: data.user.email!,
    })

    return successResponse({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('ログインに失敗しました', 500)
  }
}
