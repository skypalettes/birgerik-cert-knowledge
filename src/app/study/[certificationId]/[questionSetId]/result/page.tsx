'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Trophy, RotateCcw, Home, BookOpen, Target, Clock } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { useStudyStore } from '@/store/study-store'
import { motion } from 'framer-motion'
import { WrongQuestionsList } from '@/components/study/wrong-questions-list'
import { QuestionDetailModal } from '@/components/study/question-detail-modal'
import type { Question } from '@/store/study-store'

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const certificationId = params.certificationId as string
  const questionSetId = params.questionSetId as string
  
  const { 
    isSessionActive, 
    getScore, 
    endSession,
    mode,
    getWrongQuestions,
    startReviewSession,
  } = useStudyStore()
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  
  // セッションがない場合はリダイレクト
  useEffect(() => {
    if (!isSessionActive) {
      router.push(`/study/${certificationId}/${questionSetId}/mode-select`)
    }
  }, [isSessionActive, router, certificationId, questionSetId])
  
  if (!isSessionActive) {
    return null
  }
  
  const score = getScore()
  const percentage = score.percentage
  const wrongQuestions = getWrongQuestions()
  
  // パフォーマンス評価
  const getPerformanceMessage = () => {
    if (percentage === 100) return '完璧です！'
    if (percentage >= 80) return '素晴らしい結果です！'
    if (percentage >= 60) return 'よくできました！'
    if (percentage >= 40) return 'もう少し復習しましょう'
    return '基礎からやり直しましょう'
  }
  
  const getPerformanceColor = () => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    return 'text-yellow-600'
  }
  
  const handleRetry = () => {
    router.push(`/study/${certificationId}/${questionSetId}/practice?mode=${mode}`)
  }
  
  const handleReview = () => {
    startReviewSession()
    router.push(`/study/${certificationId}/${questionSetId}/practice?mode=review`)
  }
  
  const handleFinish = () => {
    endSession()
    router.push('/study')
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          {/* トロフィーアイコン */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                percentage >= 80
                  ? 'bg-gradient-to-br from-yellow-100 to-yellow-200'
                  : percentage >= 60
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}
            >
              <Trophy
                className={`w-12 h-12 ${
                  percentage >= 80
                    ? 'text-yellow-600'
                    : percentage >= 60
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            学習完了！
          </h1>
          <p className={`text-2xl font-semibold mb-4 ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
        </div>

        {/* スコアカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 正答率 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {percentage}%
            </div>
            <p className="text-sm text-gray-600">正答率</p>
          </motion.div>

          {/* 正解数 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {score.correct} / {score.total}
            </div>
            <p className="text-sm text-gray-600">正解数</p>
          </motion.div>

          {/* モード */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {mode === 'sequential' ? '順番' : 'ランダム'}
            </div>
            <p className="text-sm text-gray-600">学習モード</p>
          </motion.div>
        </div>

        {/* プログレスリング */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="relative w-48 h-48 mx-auto">
            <svg className="transform -rotate-90" viewBox="0 0 200 200">
              {/* 背景の円 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#e5e7eb"
                strokeWidth="20"
                fill="none"
              />
              {/* スコアの円 */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                stroke={
                  percentage >= 80
                    ? '#10b981'
                    : percentage >= 60
                    ? '#3b82f6'
                    : '#f59e0b'
                }
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 502' }}
                animate={{ strokeDasharray: `${502 * (percentage / 100)} 502` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">達成率</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 間違えた問題一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <WrongQuestionsList
            wrongQuestions={wrongQuestions}
            onViewQuestion={setSelectedQuestion}
          />
        </motion.div>

        {/* アクションボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {wrongQuestions.length > 0 && (
            <Button
              onClick={handleReview}
              size="lg"
              variant="primary"
              className="w-full sm:w-auto"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              間違えた問題を復習
            </Button>
          )}
          
          <Button
            onClick={handleRetry}
            size="lg"
            variant={wrongQuestions.length > 0 ? 'secondary' : 'primary'}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            もう一度挑戦
          </Button>
          
          <Button
            variant="outline"
            onClick={handleFinish}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="h-5 w-5 mr-2" />
            学習モードトップへ
          </Button>
        </motion.div>

        {/* Phase情報 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Phase 3.3完了 - 結果画面実装完了！
        </div>
      </motion.div>

      {/* 問題詳細モーダル */}
      <QuestionDetailModal
        question={selectedQuestion}
        isOpen={selectedQuestion !== null}
        onClose={() => setSelectedQuestion(null)}
      />
    </div>
  )
}