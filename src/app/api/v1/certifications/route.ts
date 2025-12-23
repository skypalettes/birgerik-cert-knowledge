import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import {
  getCertifications,
  createCertification,
  type CertificationWithCount,
} from '@/lib/database/certifications'
import { unstable_cache } from 'next/cache'

// キャッシュ設定（60秒）
const getCachedCertifications = unstable_cache(
  async () => {
    return await getCertifications()
  },
  ['certifications-list'],
  {
    revalidate: 60,
    tags: ['certifications']
  }
)

/**
 * GET /api/v1/certifications
 * すべての資格を取得（問題集数を含む）
 */
export const GET = withAuth(async () => {
  try {
    const certifications = await getCachedCertifications()
    return successResponse<CertificationWithCount[]>(certifications)
  } catch (error) {
    console.error('Get certifications error:', error)
    return errorResponse('資格一覧の取得に失敗しました', 500)
  }
})

/**
 * POST /api/v1/certifications
 * 新しい資格を作成
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const result = await createCertification(body)

    if (!result.success) {
      return errorResponse(result.error || '資格の作成に失敗しました', 400)
    }

    return successResponse(result.data, 201)
  } catch (error) {
    console.error('Create certification error:', error)
    return errorResponse('資格の作成に失敗しました', 500)
  }
})
