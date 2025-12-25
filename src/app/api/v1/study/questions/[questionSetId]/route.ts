import { NextResponse } from 'next/server'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import { getQuestionsWithChoices } from '@/lib/database/study'

// Next.js Route Segment Config - 60秒キャッシュ
export const revalidate = 60

/**
 * GET /api/v1/study/questions/[questionSetId]
 * 学習用：問題集の問題一覧を取得（選択肢を含む）
 * 認証不要・CORS オープン
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionSetId: string }> }
) {
  try {
    const { questionSetId } = await params

    const result = await getQuestionsWithChoices(questionSetId)

    if (result.error) {
      if (result.error.includes('見つかりません')) {
        return notFoundResponse(result.error)
      }
      return errorResponse(result.error, 500)
    }

    const response = successResponse({ questions: result.data })

    // CORSヘッダーを追加（すべてのオリジンを許可）
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    // キャッシュヘッダー（60秒）
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')

    return response
  } catch (error) {
    console.error('Get questions with choices error:', error)
    return errorResponse('問題一覧の取得に失敗しました', 500)
  }
}

/**
 * OPTIONS /api/v1/study/questions/[questionSetId]
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
