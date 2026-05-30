/**
 * 単一選択 / 複数選択 を明示するサイバーバッジ。
 * 複数選択 = フクシャ・マゼンタ（四角チェックと対応）
 * 単一選択 = エメラルドグリーン（丸チェックと対応）
 */
export function ChoiceTypeBadge({ isMultiple }: { isMultiple: boolean }) {
  if (isMultiple) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-xs border border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-950/50 px-3 py-1 rounded shadow-[0_0_8px_rgba(255,0,255,0.3)]">
        <span className="w-2 h-2 bg-fuchsia-500 animate-pulse" />
        MULTIPLE CHOICE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs border border-emerald-500/50 text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      SINGLE CHOICE
    </span>
  )
}
