'use client'

interface MagicLoaderProps {
  /** ローダー下部に表示するシステムメッセージ */
  message?: string
}

/**
 * 魔法陣 × ハッキング(デコード) 風のローディングアニメーション。
 * 回転する二重魔法陣 + パルスリング + マゼンタのデコードバー。
 */
export function MagicLoader({ message = 'SYNCHRONIZING KNOWLEDGE BASE...' }: MagicLoaderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 relative z-10">
      <div className="loader-circle mb-10">
        <div className="loader-circle-inner" />
      </div>
      <div className="font-mono text-cyan-400 text-sm tracking-[0.3em] animate-pulse text-center px-4">
        {message}
      </div>
      <div className="mt-4 flex gap-1">
        <div className="w-1 h-4 bg-fuchsia-500 animate-[pulse_1s_infinite]" />
        <div className="w-1 h-4 bg-fuchsia-500 animate-[pulse_1s_0.2s_infinite]" />
        <div className="w-1 h-4 bg-fuchsia-500 animate-[pulse_1s_0.4s_infinite]" />
      </div>
    </div>
  )
}
