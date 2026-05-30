import type { CertificationWithQuestionSets } from '@birgerik/types'

/**
 * ベンダー（資格の提供元）のテーマ定義。
 * DB にベンダー情報が無いため、資格名に含まれる文字列から Web 側で推定する（BFF 的アプローチ）。
 */
export interface Vendor {
  /** 一意キー */
  key: string
  /** セクション見出しに表示するフルネーム */
  name: string
  /** アイコンに表示する短い略称 */
  short: string
  /** Tailwind カラークラス群（セクションのテーマカラー） */
  theme: {
    /** アイコン枠・テキスト等のベースカラー（例: 'orange'） */
    border: string // border-{c}-500/30
    accentBorder: string // border-{c}-500
    accentText: string // text-{c}-400
    accentBg: string // bg-{c}-500/10
    titleText: string // text-{c}-100
    gradientFrom: string // from-{c}-500
    glow: string // 任意の shadow クラス
  }
}

/** 判定順に評価されるベンダー定義（マッチするキーワード付き） */
const VENDOR_DEFS: Array<{ vendor: Vendor; keywords: string[] }> = [
  {
    vendor: {
      key: 'aws',
      name: 'Amazon Web Services',
      short: 'AWS',
      theme: {
        border: 'border-orange-500/30',
        accentBorder: 'border-orange-500',
        accentText: 'text-orange-400',
        accentBg: 'bg-orange-500/10',
        titleText: 'text-orange-100',
        gradientFrom: 'from-orange-500',
        glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]',
      },
    },
    keywords: ['aws', 'amazon web services', 'amazon'],
  },
  {
    vendor: {
      key: 'salesforce',
      name: 'Salesforce',
      short: 'SF',
      theme: {
        border: 'border-blue-500/30',
        accentBorder: 'border-blue-500',
        accentText: 'text-blue-400',
        accentBg: 'bg-blue-500/10',
        titleText: 'text-blue-100',
        gradientFrom: 'from-blue-500',
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
      },
    },
    keywords: ['salesforce', 'sfdc'],
  },
  {
    vendor: {
      key: 'google',
      name: 'Google Cloud',
      short: 'GCP',
      theme: {
        border: 'border-emerald-500/30',
        accentBorder: 'border-emerald-500',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10',
        titleText: 'text-emerald-100',
        gradientFrom: 'from-emerald-500',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      },
    },
    keywords: ['google', 'gcp', 'google cloud'],
  },
  {
    vendor: {
      key: 'microsoft',
      name: 'Microsoft / Azure',
      short: 'MS',
      theme: {
        border: 'border-sky-500/30',
        accentBorder: 'border-sky-500',
        accentText: 'text-sky-400',
        accentBg: 'bg-sky-500/10',
        titleText: 'text-sky-100',
        gradientFrom: 'from-sky-500',
        glow: 'shadow-[0_0_10px_rgba(14,165,233,0.3)]',
      },
    },
    keywords: ['microsoft', 'azure', 'az-', 'ms-'],
  },
]

/** どのベンダーにもマッチしなかった資格のための既定グループ */
const OTHER_VENDOR: Vendor = {
  key: 'other',
  name: 'その他の資格',
  short: 'ETC',
  theme: {
    border: 'border-cyan-500/30',
    accentBorder: 'border-cyan-500',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    titleText: 'text-cyan-100',
    gradientFrom: 'from-cyan-500',
    glow: 'shadow-[0_0_10px_rgba(0,255,255,0.3)]',
  },
}

function detectVendor(certName: string): Vendor {
  const lower = certName.toLowerCase()
  for (const { vendor, keywords } of VENDOR_DEFS) {
    if (keywords.some((kw) => lower.includes(kw))) return vendor
  }
  return OTHER_VENDOR
}

export interface VendorGroup {
  vendor: Vendor
  certifications: CertificationWithQuestionSets[]
}

/**
 * 資格一覧をベンダーごとにグルーピングする。
 * 既知ベンダーを定義順に、最後に「その他」を返す（空グループは除外）。
 */
export function groupByVendor(
  certifications: CertificationWithQuestionSets[]
): VendorGroup[] {
  const buckets = new Map<string, VendorGroup>()

  for (const cert of certifications) {
    const vendor = detectVendor(cert.name)
    const existing = buckets.get(vendor.key)
    if (existing) {
      existing.certifications.push(cert)
    } else {
      buckets.set(vendor.key, { vendor, certifications: [cert] })
    }
  }

  const order = [...VENDOR_DEFS.map((d) => d.vendor.key), OTHER_VENDOR.key]
  return order
    .map((key) => buckets.get(key))
    .filter((g): g is VendorGroup => g !== undefined)
}
