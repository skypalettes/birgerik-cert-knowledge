/**
 * HTMLをプレーンテキストに変換するユーティリティ
 */

/**
 * HTMLタグを削除してプレーンテキストに変換
 */
export function stripHtml(html: string | null): string {
  if (!html) return ''

  // 基本的なHTMLタグをMarkdown風に変換
  let text = html
    // 改行タグ
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    // リスト
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul[^>]*>|<\/ul>/gi, '')
    .replace(/<ol[^>]*>|<\/ol>/gi, '')
    // 強調
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // コード
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```')
    // 見出し
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    // リンク
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // その他のHTMLタグを削除
    .replace(/<[^>]+>/g, '')
    // HTMLエンティティをデコード
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // 連続する改行を整理
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}

/**
 * HTML文字列かどうかを判定
 */
export function isHtml(text: string | null): boolean {
  if (!text) return false
  return /<[^>]+>/.test(text)
}

/**
 * テキストを表示用に整形
 * HTMLならプレーンテキストに変換、そうでなければそのまま返す
 */
export function formatText(text: string | null): string {
  if (!text) return ''

  if (isHtml(text)) {
    return stripHtml(text)
  }

  return text
}
