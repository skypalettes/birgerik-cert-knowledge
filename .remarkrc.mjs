/**
 * remarkの設定ファイル
 * markdownlintのルールに準拠したMarkdown整形のための設定
 */

import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import remarkGfm from 'remark-gfm'

const remarkConfig = {
  plugins: [
    // GitHub Flavored Markdown対応
    remarkGfm,

    // markdownlint準拠のルールセット
    remarkPresetLintConsistent, // 一貫性のあるスタイル
    remarkPresetLintRecommended, // 推奨ルール

    // カスタムルール設定
    [
      'remark-stringify',
      {
        bullet: '-', // MD004: リストマーカーを'-'に統一
        emphasis: '_', // 強調を'_'に統一
        fence: '`', // コードブロックを```に統一
        fences: true, // コードブロックはfence形式を使用
        incrementListMarker: true, // 順序付きリストの番号を増分
        listItemIndent: 'one', // MD007: リスト項目のインデント
        rule: '-', // 水平線を'---'に統一
        strong: '*', // 太字を'**'に統一
        tightDefinitions: true, // 定義リストを密にする
      },
    ],
  ],
}

export default remarkConfig
