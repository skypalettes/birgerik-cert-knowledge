export const dynamic = 'force-dynamic'

import { getCertifications } from '@/lib/api/client'
import { ExamCard } from '@/components/exam/exam-card'
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-teal-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/study" className="text-xl font-black text-teal-600">
            Birgerik
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/study" className="text-gray-600 hover:text-teal-600 transition-colors">
              学習
            </Link>
            <Link href="/exam" className="text-teal-600 font-bold">
              試験
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/study"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          学習トップへ
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-800">試験モード</h1>
        <p className="text-gray-500 mb-8">制限時間・合格ライン付きで実力を試せます</p>

        {examItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            試験が設定された問題集がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examItems.map((item) => (
              <ExamCard key={item.id} questionSet={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
