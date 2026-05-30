import Link from 'next/link'

interface CyberHeaderProps {
  /** ナビ上でアクティブにするタブ */
  active?: 'study' | 'exam'
  /** ナビゲーションを表示するか（試験セッション中などは非表示） */
  showNav?: boolean
}

/**
 * 全画面共通のサイバーヘッダー。
 * 左にロゴ（ひし形 + Birgerik）、右にナビ or SYS_ONLINE インジケータ。
 */
export function CyberHeader({ active, showNav = true }: CyberHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/30">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/study" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_#0ff]">
            <div className="w-4 h-4 bg-cyan-400 rotate-45 group-hover:rotate-[135deg] transition-transform duration-500" />
          </div>
          <div className="text-cyan-300 font-serif font-bold text-xl drop-shadow-[0_0_5px_#0ff]">
            Birgerik
          </div>
        </Link>

        {showNav ? (
          <nav className="flex items-center gap-6 text-sm font-mono tracking-wide">
            <Link
              href="/study"
              className={
                active === 'study'
                  ? 'text-cyan-300 drop-shadow-[0_0_5px_#0ff]'
                  : 'text-slate-400 hover:text-cyan-300 transition-colors'
              }
            >
              STUDY
            </Link>
            <Link
              href="/exam"
              className={
                active === 'exam'
                  ? 'text-cyan-300 drop-shadow-[0_0_5px_#0ff]'
                  : 'text-slate-400 hover:text-cyan-300 transition-colors'
              }
            >
              EXAM
            </Link>
          </nav>
        ) : (
          <span className="text-xs text-cyan-500 font-mono tracking-widest border border-cyan-800 bg-cyan-900/30 px-3 py-1 rounded">
            SYS_ONLINE
          </span>
        )}
      </div>
    </header>
  )
}
