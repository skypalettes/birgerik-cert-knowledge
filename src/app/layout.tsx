import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

// Google Fontsの読み込みをスキップして、システムフォントを使用
// ネットワーク環境によってはGoogle Fontsが取得できないため

export const metadata: Metadata = {
  title: 'Birgerik - 資格取得支援アプリケーション',
  description: '資格試験の問題を蓄積して、自由に学習できるアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}