import { CertificationList } from './certification-list'
import { getCertifications } from '@/lib/actions/certifications'
import { ErrorMessage } from '@/components/shared/error/error-message'

export const metadata = {
  title: '資格管理 - Birgerik Core',
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
    <>
      {error && <ErrorMessage title="エラーが発生しました" message={error} />}
      {!error && certifications && (
        <CertificationList initialCertifications={certifications} />
      )}
    </>
  )
}
