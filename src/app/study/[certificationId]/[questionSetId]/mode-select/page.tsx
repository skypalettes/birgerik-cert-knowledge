'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  ListOrdered,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { getQuestionSetDetail } from '@/lib/actions/study'

export default function ModeSelectPage() {
  const router = useRouter()
  const params = useParams()
  const certificationId = params.certificationId as string
  const questionSetId = params.questionSetId as string

  const [questionSet, setQuestionSet] = useState<{
    id: string
    name: string
    description: string | null
    certification_name: string
    question_count: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const result = await getQuestionSetDetail(questionSetId)

        if (result.error) {
          setError(result.error)
          return
        }

        setQuestionSet(result.data)
      } catch (_err) {
        setError('データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [questionSetId])

  const handleModeSelect = (mode: 'sequential' | 'random') => {
    router.push(`/study/${certificationId}/${questionSetId}/practice?mode=${mode}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !questionSet) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">エラー</h3>
              <p className="mt-1 text-sm text-red-700">
                {error || '問題集が見つかりませんでした'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link href={`/study/${certificationId}`}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              問題集一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link href={`/study/${certificationId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            問題集一覧に戻る
          </Button>
        </Link>
      </div>

      {/* 問題集情報 */}
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
          {questionSet.certification_name}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {questionSet.name}
        </h1>
        {questionSet.description && (
          <p className="text-gray-600 mb-4">{questionSet.description}</p>
        )}
        <p className="text-lg font-semibold text-gray-700">
          全{questionSet.question_count}問
        </p>
      </div>

      {/* モード選択 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          学習モードを選択してください
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 順番に解くモード */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleModeSelect('sequential')}
            className="cursor-pointer bg-white rounded-xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ListOrdered className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                順番に解く
              </h3>
              <p className="text-gray-600 mb-4">
                問題を順番通りに解いて、体系的に学習します
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>このモードで学習</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </motion.div>

          {/* ランダムに解くモード */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleModeSelect('random')}
            className="cursor-pointer bg-white rounded-xl shadow-lg border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shuffle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ランダムに解く
              </h3>
              <p className="text-gray-600 mb-4">
                問題をランダムに出題して、実力を試します
              </p>
              <div className="flex items-center text-green-600 font-medium">
                <span>このモードで学習</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 学習のヒント */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">学習のポイント</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>
              <strong>順番に解く:</strong>
              初めて学習する内容や、基礎を固めたい場合におすすめです
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <span>
              <strong>ランダムに解く:</strong>
              知識の定着度を確認したい場合や、復習におすすめです
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}