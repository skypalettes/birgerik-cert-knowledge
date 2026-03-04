/**
 * HTMLタグを除去してプレーンテキストを返す
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z]+;/g, ' ').trim()
}

/**
 * テキストのプレビューを返す（最大文字数を指定）
 */
export function getTextPreview(text: string, maxLength: number): string {
  const plain = stripHtml(text)
  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength) + '...'
}
