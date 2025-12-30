import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'
import { z } from 'zod'

// リフレッシュリクエストのスキーマ
const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'リフレッシュトークンが必要です'),
})

/**
 * POST /api/v1/auth/refresh
 * リフレッシュトークンを使用して新しいアクセストークンを取得
 *
 * Obsidianプラグイン用のトークンリフレッシュAPI
 * banned状態のユーザーはリフレッシュできない
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const result = refreshSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error.flatten().fieldErrors)
    }

    const { refresh_token } = result.data

    // Supabase Clientを作成（Anon Keyを使用）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // リフレッシュトークンで新しいセッションを取得
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error || !data.session) {
      return errorResponse('トークンのリフレッシュに失敗しました', 401)
    }

    // 新しいトークンを返す
    return successResponse({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      user: {
        id: data.user!.id,
        email: data.user!.email,
      },
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return errorResponse('トークンのリフレッシュに失敗しました', 500)
  }
}
