import { CertificationList } from './certification-list'
import { getCertifications } from './actions'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '資格管理 - Birgerik Core',
  description: '資格情報の登録・編集・削除',
}

export default async function CertificationsPage() {
  let certifications
  let error = null

  try {
    certifications = await getCertifications()
  } catch (e) {
    console.error('Failed to fetch certifications:', e)
    error = 'データの読み込みに失敗しました'
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">資格管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            資格試験の登録と管理を行います
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <ErrorMessage
            title="エラーが発生しました"
            message={error}
          />
        )}

        {/* 資格一覧 */}
        {!error && certifications && (
          <CertificationList initialCertifications={certifications} />
        )}
      </div>
    </div>
  )
}