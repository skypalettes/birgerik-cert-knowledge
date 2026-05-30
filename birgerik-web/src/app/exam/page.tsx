export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { ExamCard } from '@/components/exam/exam-card'
import { CyberHeader } from '@/components/shared/cyber-header'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ExamPage() {
  const { certifications } = await getCertifications()

  const examItems = certifications.flatMap((cert) =>
    cert.question_sets
      .filter((qs) => qs.has_exam && qs.is_active)
      .map((qs) => ({ ...qs, certificationName: cert.name }))
  )

  return (
    <>
      <CyberHeader active="exam" />
      <main className="max-w-5xl mx-auto w-full px-4 py-12">
        <Link
          href="/study"
          className="inline-flex items-center gap-1 text-sm font-mono text-slate-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          学習トップへ
        </Link>

        <div className="mb-10 border-l-4 border-fuchsia-400 pl-6">
          <h1 className="text-3xl font-serif font-bold mb-2 text-slate-100">試験モード</h1>
          <p className="text-fuchsia-400 font-mono text-sm tracking-wide">
            Prove your mastery under time pressure.
          </p>
        </div>

        {examItems.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono">
            試験が設定された問題集がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examItems.map((item) => (
              <ExamCard key={item.id} questionSet={item} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
