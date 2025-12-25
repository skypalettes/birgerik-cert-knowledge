import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertificationsWithQuestionSets } from '@/lib/database/study'

// Next.js Route Segment Config - 60秒キャッシュ
export const revalidate = 60

/**
 * GET /api/v1/study/certifications
 * 学習用：すべての資格と問題集を取得
 * 認証不要・CORS オープン
 */
export async function GET() {
  try {
    const result = await getCertificationsWithQuestionSets()

    if (result.error) {
      return errorResponse(result.error, 500)
    }

    const response = successResponse({ certifications: result.data })

    // CORSヘッダーを追加（すべてのオリジンを許可）
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    // キャッシュヘッダー（60秒）
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')

    return response
  } catch (error) {
    console.error('Get certifications with question sets error:', error)
    return errorResponse('資格一覧の取得に失敗しました', 500)
  }
}

/**
 * OPTIONS /api/v1/study/certifications
 * CORS Preflightリクエスト対応
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
