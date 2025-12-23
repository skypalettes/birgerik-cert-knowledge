import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'
import {
  getCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/database/certifications'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/certifications/[id]
 * 特定の資格を取得
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const getCachedCertification = unstable_cache(
      async (certId: string) => {
        return await getCertification(certId)
      },
      [`certification-${id}`],
      {
        revalidate: 60,
        tags: [`certification-${id}`, 'certifications']
      }
    )

    const certification = await getCachedCertification(id)

    if (!certification) {
      return notFoundResponse('資格が見つかりません')
    }

    return successResponse(certification)
  } catch (error) {
    console.error('Get certification error:', error)
    return errorResponse('資格の取得に失敗しました', 500)
  }
})

/**
 * PUT /api/v1/certifications/[id]
 * 資格を更新
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateCertification(id, body)

    if (!result.success) {
      return errorResponse(result.error || '資格の更新に失敗しました', 400)
    }

    return successResponse({ message: '資格を更新しました' })
  } catch (error) {
    console.error('Update certification error:', error)
    return errorResponse('資格の更新に失敗しました', 500)
  }
})

/**
 * DELETE /api/v1/certifications/[id]
 * 資格を削除
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const result = await deleteCertification(id)

    if (!result.success) {
      return errorResponse(result.error || '資格の削除に失敗しました', 400)
    }

    return successResponse({ message: '資格を削除しました' })
  } catch (error) {
    console.error('Delete certification error:', error)
    return errorResponse('資格の削除に失敗しました', 500)
  }
})
