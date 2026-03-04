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
 * markdownlintのルールに準拠したMarkdown整形
 */
export async function formatMarkdownLint(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return ''
  }

  try {
    let markdown = content.replace(/([^\n])(```)/g, '$1\n\n$2')
    markdown = markdown.replace(/([^\n])\n([-*+]|\d+\.)\s/g, '$1\n\n$2 ')

    const { unified } = await import('unified')
    const { default: remarkParse } = await import('remark-parse')
    const { default: remarkGfm } = await import('remark-gfm')
    const { default: remarkStringify } = await import('remark-stringify')

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify, {
        bullet: '-',
        emphasis: '_',
        fence: '`',
        fences: true,
        incrementListMarker: true,
        listItemIndent: 'one',
        rule: '-',
        strong: '*',
        tightDefinitions: true,
      })

    const file = await processor.process(markdown)
    let formatted = String(file)

    formatted = formatted
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')

    formatted = formatted.replace(/\t/g, '  ')
    formatted = formatted.trim() + '\n'

    return formatted
  } catch (error) {
    console.error('Markdown整形エラー:', error)
    return content
  }
}
