import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertificationsWithQuestionSets } from '@/lib/database/study'
import { unstable_cache } from 'next/cache'

// キャッシュ設定（60秒）
const getCachedCertificationsWithQuestionSets = unstable_cache(
  async () => {
    return await getCertificationsWithQuestionSets()
  },
  ['study-certifications'],
  {
    revalidate: 60,
    tags: ['certifications', 'question-sets']
  }
)

/**
 * GET /api/v1/study/certifications
 * 学習用：すべての資格と問題集を取得
 */
export const GET = withAuth(async () => {
  try {
    const result = await getCachedCertificationsWithQuestionSets()

    if (result.error) {
      return errorResponse(result.error, 500)
    }

    return successResponse({ certifications: result.data })
  } catch (error) {
    console.error('Get certifications with question sets error:', error)
    return errorResponse('資格一覧の取得に失敗しました', 500)
  }
})
