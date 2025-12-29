import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { getQuestionSetDetail } from '@/lib/database/study'
import { verifySupabaseToken } from '@/lib/api/verify-supabase-token'

// Next.js Route Segment Config - 60秒キャッシュ
export const revalidate = 60

/**
 * GET /api/v1/study/question-sets/[id]
 * 学習用：問題集の詳細を取得（問題数を含む）
 * 認証必須（Supabaseトークン）・CORS オープン
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // トークン検証
    const { valid, error } = await verifySupabaseToken(request)

    if (!valid) {
      const response = errorResponse(error || 'Unauthorized', 401)
      // CORSヘッダーを追加
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      return response
    }

    const { id } = await params

    const result = await getQuestionSetDetail(id)

    if (result.error) {
      if (result.error.includes('見つかりません')) {
        return notFoundResponse(result.error)
      }
      return errorResponse(result.error, 500)
    }

    const response = successResponse({ question_set: result.data })

    // CORSヘッダーを追加（すべてのオリジンを許可）
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    // キャッシュヘッダー（60秒）
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')

    return response
  } catch (error) {
    console.error('Get question set detail error:', error)
    return errorResponse('問題集の取得に失敗しました', 500)
  }
}

/**
 * OPTIONS /api/v1/study/question-sets/[id]
 * CORS Preflightリクエスト対応
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
