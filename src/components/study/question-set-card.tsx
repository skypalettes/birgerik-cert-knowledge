'use client'

import { motion } from 'framer-motion'
import { FileQuestion, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/shared/ui/badge'
import { cn } from '@/lib/utils/cn'

interface QuestionSetCardProps {
  id: string
  name: string
  description: string | null
  questionCount: number
}

export function QuestionSetCard({
  name,
  description,
  questionCount,
}: QuestionSetCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group cursor-pointer',
        'bg-white rounded-xl shadow-sm border border-gray-200',
        'hover:shadow-lg hover:border-green-300',
        'transition-all duration-200',
        'overflow-hidden'
      )}
    >
      <div className="p-6">
        {/* アイコンとバッジ */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-blue-200 transition-colors">
            <FileQuestion className="h-6 w-6 text-green-600" />
          </div>
          <Badge variant="success" className="text-xs">
            {questionCount}問
          </Badge>
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {name}
        </h3>

        {/* 説明 */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* アクションボタン */}
        <div className="flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
          <span>学習を始める</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* ホバーエフェクト用のグラデーション */}
      <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  )
}