import { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function StudyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Birgerik
              </span>
            </Link>

            <nav className="flex space-x-1">
              <Link
                href="/study"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                学習モード
              </Link>
              <Link
                href="/exam"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                試験モード
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>{children}</main>
    </div>
  )
}