/**
 * HTMLからプレーンテキストを抽出する
 * - HTMLタグを除去
 * - エンティティをデコード
 * - 改行を適切に処理
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  
  // HTMLタグを除去
  let text = html.replace(/<[^>]*>/g, '')
  
  // HTMLエンティティをデコード
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // 連続する空白を1つにまとめる
  text = text.replace(/\s+/g, ' ')
  
  // 前後の空白を除去
  text = text.trim()
  
  return text
}

/**
 * HTMLを表示用にフォーマット
 * - プレーンテキストに変換
 * - 指定された最大文字数で切り詰め
 */
export function formatHtmlForDisplay(
  html: string,
  maxLength?: number
): string {
  const text = stripHtml(html)
  
  if (!maxLength || text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength) + '...'
}

/**
 * TiptapのHTMLコンテンツから簡易的なテキストプレビューを生成
 * リストやコードブロックなども考慮
 */
export function getTextPreview(html: string, maxLength: number = 100): string {
  if (!html) return ''

  // scriptタグとstyleタグを除去
  const cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // コードブロックの場合は [コード] と表示
  if (cleanedHtml.includes('<pre>') || cleanedHtml.includes('<code>')) {
    const codeText = stripHtml(cleanedHtml)
    if (codeText.length > 20) {
      return `[コード] ${codeText.slice(0, 30)}...`
    }
  }

  // リストの場合は項目を抜粋
  if (cleanedHtml.includes('<li>')) {
    const items = cleanedHtml.match(/<li[^>]*>(.*?)<\/li>/g)
    if (items && items.length > 0) {
      const firstItem = stripHtml(items[0])
      if (items.length > 1) {
        return `• ${firstItem}... (他${items.length - 1}項目)`
      }
      return `• ${firstItem}`
    }
  }

  // 通常のテキスト
  return formatHtmlForDisplay(cleanedHtml, maxLength)
}