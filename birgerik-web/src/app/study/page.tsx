export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { CertificationCard } from '@/components/study/certification-card'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { BookOpen } from 'lucide-react'

export default async function StudyPage() {
  const { certifications } = await getCertifications()

  if (certifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="資格がありません"
          description="管理者にお問い合わせください"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">学習する資格を選択</h1>
      <p className="text-gray-500 mb-8">取り組みたい資格・カテゴリを選んでください</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <CertificationCard key={cert.id} certification={cert} />
        ))}
      </div>
    </div>
  )
}
