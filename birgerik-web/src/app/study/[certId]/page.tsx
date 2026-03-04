export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { QuestionSetCard } from '@/components/study/question-set-card'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { FileText } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type Props = { params: Promise<{ certId: string }> }

export default async function CertificationPage({ params }: Props) {
  const { certId } = await params
  const { certifications } = await getCertifications()
  const cert = certifications.find((c) => c.id === certId)
  if (!cert) notFound()

  const activeSets = cert.question_sets.filter((qs) => qs.is_active)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/study"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        資格一覧に戻る
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-gray-800">{cert.name}</h1>
      {cert.description && (
        <p className="text-gray-500 mb-8">{cert.description}</p>
      )}

      {activeSets.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="問題集がありません"
          description="有効な問題集が登録されていません"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSets.map((qs) => (
            <QuestionSetCard key={qs.id} certId={certId} questionSet={qs} />
          ))}
        </div>
      )}
    </div>
  )
}
