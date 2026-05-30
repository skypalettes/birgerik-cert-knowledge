export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { VendorSection } from '@/components/study/vendor-section'
import { groupByVendor } from '@/lib/utils/vendor'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { BookOpen } from 'lucide-react'

export default async function StudyPage() {
  const { certifications } = await getCertifications()

  if (certifications.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="資格がありません"
          description="管理者にお問い合わせください"
        />
      </div>
    )
  }

  const groups = groupByVendor(certifications)

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-12">
      <div className="mb-12 border-l-4 border-cyan-400 pl-6">
        <h1 className="text-4xl font-serif font-bold text-slate-100 mb-2">知識の書庫へようこそ</h1>
        <p className="text-cyan-400 font-mono text-sm tracking-wide">
          Select a grimoire to synchronize your brain.
        </p>
      </div>

      {groups.map((group) => (
        <VendorSection key={group.vendor.key} group={group} />
      ))}
    </div>
  )
}
