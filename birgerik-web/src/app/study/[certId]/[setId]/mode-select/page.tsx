export const dynamic = 'force-dynamic'

import { getQuestionSetDetail } from '@/lib/api/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default async function ModeSelectPage({ params }: Props) {
  const { certId, setId } = await params
  const { question_set } = await getQuestionSetDetail(setId).catch(() => notFound() as never)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href={`/study/${certId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        問題集一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-gray-800">{question_set.name}</h1>
      <p className="text-gray-500 mb-10">{question_set.question_count} 問</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href={`/study/${certId}/${setId}/practice?mode=sequential`}>
          <ModeCard
            icon="📋"
            title="順番に解く"
            description="問題を順番に解き、基礎を固める"
          />
        </Link>
        <Link href={`/study/${certId}/${setId}/practice?mode=random`}>
          <ModeCard
            icon="🔀"
            title="ランダムに解く"
            description="問題をシャッフルして実力を試す"
          />
        </Link>
      </div>
    </div>
  )
}

function ModeCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white border-2 border-teal-50 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="font-bold text-lg mb-1 text-gray-800">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}
