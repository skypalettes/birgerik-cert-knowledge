import Link from 'next/link'

export default function StudyLayout({ children }: { children: React.ReactNode }) {
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
            <Link href="/exam" className="text-gray-600 hover:text-teal-600 transition-colors">
              試験
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
