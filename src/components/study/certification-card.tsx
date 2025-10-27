'use client'

import { motion } from 'framer-motion'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/shared/ui/badge'
import { cn } from '@/lib/utils/cn'

interface CertificationCardProps {
  id: string
  name: string
  description: string | null
  questionSetCount: number
}

export function CertificationCard({
  name,
  description,
  questionSetCount,
}: CertificationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group cursor-pointer',
        'bg-white rounded-xl shadow-sm border border-gray-200',
        'hover:shadow-lg hover:border-blue-300',
        'transition-all duration-200',
        'overflow-hidden'
      )}
    >
      <div className="p-6">
        {/* アイコンとバッジ */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-green-200 transition-colors">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <Badge variant="info" className="text-xs">
            {questionSetCount}問題集
          </Badge>
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* 説明 */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* アクションボタン */}
        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
          <span>問題集を選ぶ</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* ホバーエフェクト用のグラデーション */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  )
}