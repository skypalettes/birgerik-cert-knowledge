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

function formatText(text: string, useBr = false): string {
  const escaped = escapeHtml(text)
  if (useBr) return escaped.split('\n').map(line => `<p>${line.replace(/\n/g, '<br>')}</p>`).join('')
  return escaped.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')
}

export function parseMarkdownToHtml(content: string, withLineNumbers = false, useBr = false): string {
  if (!content) return withLineNumbers || useBr ? '<p></p>' : ''

  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let result = ''
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const beforeText = content.substring(lastIndex, match.index)
    if (beforeText) result += useBr ? `<p>${escapeHtml(beforeText).replace(/\n/g, '<br>')}</p>` : formatText(beforeText)

    const language = match[1] || ''
    const code = match[2].replace(/\n+$/, '')

    if (withLineNumbers) {
      const numberedLines = code.split('\n').map((line, i) =>
        `<span class="code-line"><span class="line-number">${i + 1}</span><span class="line-content">${escapeHtml(line)}</span></span>`
      ).join('\n')
      result += `<pre class="code-block"><code class="language-${language}">${numberedLines}</code></pre>`
    } else {
      result += `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`
    }

    lastIndex = match.index + match[0].length
  }

  const afterText = content.substring(lastIndex)
  if (afterText || lastIndex === 0) {
    const trimmed = lastIndex > 0 ? afterText.replace(/^\n+/, '') : afterText
    result += useBr ? `<p>${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>` : formatText(trimmed)
  }

  return result || '<p></p>'
}

export function parseHtmlToMarkdown(html: string): string {
  if (!html) return ''

  const cleanedHtml = html.replace(/<p><\/p>/g, '').replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '\n')
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
