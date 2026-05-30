export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { QuestionSetCard } from '@/components/study/question-set-card'
import { EmptyState } from '@/components/shared/ui/empty-state'
import { FileText, ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ certId: string }> }

export default async function CertificationPage({ params }: Props) {
  const { certId } = await params
  const { certifications } = await getCertifications()
  const cert = certifications.find((c) => c.id === certId)
  if (!cert) notFound()

  const activeSets = cert.question_sets.filter((qs) => qs.is_active)

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-12">
      <Link
        href="/study"
        className="inline-flex items-center gap-1 text-sm font-mono text-slate-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        資格一覧に戻る
      </Link>

      <div className="mb-10 border-l-4 border-cyan-400 pl-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-slate-100">{cert.name}</h1>
        {cert.description && <p className="text-slate-400 font-serif">{cert.description}</p>}
      </div>

      {activeSets.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="問題集がありません"
          description="有効な問題集が登録されていません"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSets.map((qs) => (
            <QuestionSetCard key={qs.id} certId={certId} questionSet={qs} />
          ))}
        </div>
      )}
    </div>
  )
}
