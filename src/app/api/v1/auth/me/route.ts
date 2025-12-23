import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/auth/me
 * 現在ログイン中のユーザー情報を取得
 */
export const GET = withAuth(async () => {
  try {
    const supabase = await createClient()

    // Supabaseからユーザー情報を取得
    const { data: userData, error } = await supabase.auth.getUser()

    if (error || !userData.user) {
      return errorResponse('ユーザー情報の取得に失敗しました', 404)
    }

    return successResponse({
      id: userData.user.id,
      email: userData.user.email,
      created_at: userData.user.created_at,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('ユーザー情報の取得に失敗しました', 500)
  }
})
