import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth/jwt'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    if (error || !data.user) {
      return errorResponse('メールアドレスまたはパスワードが正しくありません', 401)
    }

    if (data.user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return errorResponse('管理者権限がありません', 403)
    }

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email!,
    })

    return successResponse({
      token,
      supabase_access_token: data.session?.access_token,
      user: { id: data.user.id, email: data.user.email, role: data.user.user_metadata?.role },
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('ログイン処理中にエラーが発生しました', 500)
  }
}
