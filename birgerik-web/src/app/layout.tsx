import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Noto_Serif_JP, Fira_Code } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const notoSerifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Birgerik.Grimoire',
  description: '資格学習・試験アプリケーション',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${notoSerifJp.variable} ${firaCode.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(13, 25, 48, 0.9)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  )
}
