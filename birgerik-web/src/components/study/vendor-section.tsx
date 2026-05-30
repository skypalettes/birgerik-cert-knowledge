import type { VendorGroup } from '@/lib/utils/vendor'
import { CertificationCard } from './certification-card'

/**
 * ベンダーごとの資格セクション。
 * 見出し（アイコン + ベンダー名 + テーマカラーの下線）と資格カードのグリッドを表示。
 * Server Component（カードのみクライアント）。
 */
export function VendorSection({ group }: { group: VendorGroup }) {
  const { vendor, certifications } = group
  const { theme } = vendor

  return (
    <section className="mb-12">
      <div className={`flex items-center gap-3 border-b ${theme.border} pb-3 mb-6 relative`}>
        <div
          className={`w-10 h-10 ${theme.accentBg} border-2 ${theme.accentBorder} rounded flex items-center justify-center ${theme.accentText} font-bold font-mono text-sm ${theme.glow}`}
        >
          {vendor.short}
        </div>
        <h2 className={`text-2xl font-serif ${theme.titleText}`}>{vendor.name}</h2>
        <div
          className={`absolute bottom-0 left-0 w-32 h-0.5 bg-gradient-to-r ${theme.gradientFrom} to-transparent`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert, i) => (
          <CertificationCard key={cert.id} certification={cert} index={i} />
        ))}
      </div>
    </section>
  )
}
