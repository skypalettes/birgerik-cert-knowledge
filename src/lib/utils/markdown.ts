export function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function unescapeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
}

/**
 * インラインマークダウン（リンク、太字、斜体、コード）を処理する
 * プレースホルダーを使って安全にエスケープとマークダウン処理を両立
 */
function processInlineMarkdown(text: string): string {
  let result = text

  // リンクの処理 [ラベル](URL) - プレースホルダーに置き換え
  const links: string[] = []
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    const escapedText = escapeHtml(linkText)
    const escapedUrl = escapeHtml(url)
    const link = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`
    const placeholder = `___LINK_${links.length}___`
    links.push(link)
    return placeholder
  })

  // 太字の処理 - プレースホルダーに置き換え
  const bolds: string[] = []
  result = result.replace(/\*\*(.+?)\*\*/g, (match, content) => {
    const bold = `<strong>${escapeHtml(content)}</strong>`
    const placeholder = `___BOLD_${bolds.length}___`
    bolds.push(bold)
    return placeholder
  })

  // 斜体の処理 - プレースホルダーに置き換え
  const italics: string[] = []
  result = result.replace(/\*(.+?)\*/g, (match, content) => {
    const italic = `<em>${escapeHtml(content)}</em>`
    const placeholder = `___ITALIC_${italics.length}___`
    italics.push(italic)
    return placeholder
  })

  // インラインコードの処理 - プレースホルダーに置き換え
  const codes: string[] = []
  result = result.replace(/`(.+?)`/g, (match, content) => {
    const code = `<code>${escapeHtml(content)}</code>`
    const placeholder = `___CODE_${codes.length}___`
    codes.push(code)
    return placeholder
  })

  // 残りのテキストをエスケープ
  result = escapeHtml(result)

  // プレースホルダーを元に戻す
  links.forEach((link, index) => {
    result = result.replace(`___LINK_${index}___`, link)
  })
  bolds.forEach((bold, index) => {
    result = result.replace(`___BOLD_${index}___`, bold)
  })
  italics.forEach((italic, index) => {
    result = result.replace(`___ITALIC_${index}___`, italic)
  })
  codes.forEach((code, index) => {
    result = result.replace(`___CODE_${index}___`, code)
  })

  return result
}

export function parseMarkdownToHtml(content: string, withLineNumbers = false, useBr = false): string {
  if (!content) return withLineNumbers || useBr ? '<p></p>' : ''

  let result = content

  // コードブロックの処理
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  const codeBlocks: string[] = []
  result = result.replace(codeBlockRegex, (match, language, code) => {
    const cleanCode = code.replace(/\n+$/, '')
    let html = ''
    if (withLineNumbers) {
      const numberedLines = cleanCode.split('\n').map((line: string, i: number) =>
        `<span class="code-line"><span class="line-number">${i + 1}</span><span class="line-content">${escapeHtml(line)}</span></span>`
      ).join('\n')
      html = `<pre class="code-block"><code class="language-${language}">${numberedLines}</code></pre>`
    } else {
      html = `<pre><code class="language-${language}">${escapeHtml(cleanCode)}</code></pre>`
    }
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`
    codeBlocks.push(html)
    return placeholder
  })

  // 見出しの処理
  result = result.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length
    return `<h${level}>${processInlineMarkdown(text)}</h${level}>`
  })

  // 箇条書きリスト（-、*、+）の処理
  result = result.replace(/(^|\n\n)((?:[-*+]\s+.+(?:\n|$))+)/g, (match, prefix, listContent) => {
    const items = listContent
      .trim()
      .split('\n')
      .map((line: string) => {
        const itemMatch = line.match(/^[-*+]\s+(.+)$/)
        return itemMatch ? `<li>${processInlineMarkdown(itemMatch[1])}</li>` : ''
      })
      .filter(Boolean)
      .join('')
    return prefix + `<ul>${items}</ul>`
  })

  // 番号付きリスト（1.、2.など）の処理
  result = result.replace(/(^|\n\n)((?:\d+\.\s+.+(?:\n|$))+)/g, (match, prefix, listContent) => {
    const items = listContent
      .trim()
      .split('\n')
      .map((line: string) => {
        const itemMatch = line.match(/^\d+\.\s+(.+)$/)
        return itemMatch ? `<li>${processInlineMarkdown(itemMatch[1])}</li>` : ''
      })
      .filter(Boolean)
      .join('')
    return prefix + `<ol>${items}</ol>`
  })

  // 段落の処理（リストとコードブロック以外）
  result = result
    .split(/\n\n+/)
    .map((block: string) => {
      const trimmed = block.trim()
      // HTMLタグ、コードブロックプレースホルダー、空文字はそのまま
      if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('___CODE_BLOCK_')) {
        return trimmed
      }
      // 1行のテキストは段落タグで囲む（インライン処理を適用）
      const lines = trimmed.split('\n').filter((line: string) => line.trim())
      if (lines.length === 0) return ''
      if (useBr) {
        const processedLines = lines.map((line: string) => processInlineMarkdown(line)).join('<br>')
        return `<p>${processedLines}</p>`
      }
      return lines.map((line: string) => `<p>${processInlineMarkdown(line)}</p>`).join('')
    })
    .filter(Boolean)
    .join('')

  // コードブロックのプレースホルダーを戻す
  codeBlocks.forEach((code, index) => {
    result = result.replace(`___CODE_BLOCK_${index}___`, code)
  })

  return result || '<p></p>'
}

export function parseHtmlToMarkdown(html: string): string {
  if (!html) return ''

  // 段落の境界を改行に変換してから、pタグを削除する
  const cleanedHtml = html
    .replace(/<p><\/p>/g, '') // 空のpタグを削除
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '\n') // brだけのpタグを改行に
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n') // 段落の境界を改行に変換
  const codeBlockRegex = /<pre[^>]*><code(?:\s+class="language-(\w+)")?>([^]*?)<\/code><\/pre>/g
  let result = ''
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(cleanedHtml)) !== null) {
    const beforeHtml = cleanedHtml.substring(lastIndex, match.index)
    if (beforeHtml) {
      const text = beforeHtml.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/gi, '\n')
      const unescaped = unescapeHtml(text)
      if (unescaped) result += unescaped
    }

    const lang = match[1] || ''
    const code = match[2].replace(/\n+$/, '')
    result += '```' + lang + '\n' + unescapeHtml(code) + '\n```'

    lastIndex = match.index + match[0].length
  }

  const afterHtml = cleanedHtml.substring(lastIndex)
  if (afterHtml) {
    const text = afterHtml.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/gi, '\n')
    const unescaped = unescapeHtml(text)
    if (unescaped) result += lastIndex > 0 ? unescaped.replace(/^\n+/, '') : unescaped
  }

  return result.trim()
}

/**
 * markdownlintのルールに準拠したMarkdown整形を行う
 *
 * 適用されるルール:
 * - MD001: 見出しレベルの段階的増加
 * - MD003: ATXスタイル見出し（#）に統一
 * - MD004: リストマーカー統一（-）
 * - MD007: リストインデント2スペース
 * - MD009: 末尾空白削除
 * - MD010: タブをスペースに変換
 * - MD022: 見出し前後の空白行
 * - MD030: リストマーカー後のスペース統一
 *
 * @param content - 整形対象のMarkdownテキスト
 * @returns markdownlintルールに準拠した整形済みMarkdownテキスト
 */
export async function formatMarkdownLint(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return ''
  }

  try {
    // remarkに渡す前の前処理：コードブロック・リストの前に空行を確保
    // コードブロックの前に改行を挿入（段落直後の```）
    let markdown = content.replace(/([^\n])(```)/g, '$1\n\n$2')
    // 段落直後のリスト（-、*、+、1.）の前に改行を挿入
    markdown = markdown.replace(/([^\n])\n([-*+]|\d+\.)\s/g, '$1\n\n$2 ')

    // remarkでmarkdownlintルールに準拠した整形を実行
    const { unified } = await import('unified')
    const { default: remarkParse } = await import('remark-parse')
    const { default: remarkGfm } = await import('remark-gfm')
    const { default: remarkStringify } = await import('remark-stringify')

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify, {
        bullet: '-', // MD004: リストマーカーを'-'に統一
        emphasis: '_', // 強調を'_'に統一
        fence: '`', // コードブロックを```に統一
        fences: true, // コードブロックはfence形式を使用
        incrementListMarker: true, // 順序付きリストの番号を増分
        listItemIndent: 'one', // MD007: リスト項目のインデント
        rule: '-', // 水平線を'---'に統一
        strong: '*', // 太字を'**'に統一
        tightDefinitions: true, // 定義リストを密にする
      })

    const file = await processor.process(markdown)
    let formatted = String(file)

    // MD009: 末尾空白を削除
    formatted = formatted
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')

    // MD010: タブをスペースに変換
    formatted = formatted.replace(/\t/g, '  ')

    // 最後に改行を1つだけにする
    formatted = formatted.trim() + '\n'

    return formatted
  } catch (error) {
    console.error('Markdown整形エラー:', error)
    // エラーが発生した場合は元のテキストを返す
    return content
  }
}
