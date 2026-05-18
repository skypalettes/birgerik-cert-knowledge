import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, extname, basename, isAbsolute } from 'node:path'
import matter from 'gray-matter'
import type { Database } from '../src/lib/types/database.types'

// ============================================================
// 環境変数の読み込み（export-questions.ts と同じ挙動）
// ============================================================
function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  try {
    process.loadEnvFile(envPath)
  } catch (error) {
    console.warn(`.env.local の読み込みに失敗しました: ${(error as Error).message}`)
  }
}

loadLocalEnv()

// ============================================================
// 型定義
// ============================================================
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type ChoiceInsert = Database['public']['Tables']['choices']['Insert']

interface ParsedChoice {
  choice_text: string
  is_correct: boolean
}

interface ParsedQuestion {
  id: string
  question_set_id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: ParsedChoice[]
}

interface CliOptions {
  dryRun: boolean
  changedOnly: boolean
  forceDelete: boolean
}

interface Summary {
  upserted: number
  deleted: number
  skipped: number
  errored: number
}

// ============================================================
// 定数
// ============================================================
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CHOICE_LINE_RE = /^\s*-\s*\[( |x|X)\]\s?(.*)$/
// git diff の無効ベース（リポジトリ初回 push 時の github.event.before）
const ZERO_SHA = /^0+$/

// ============================================================
// CLI 引数のパース
// ============================================================
function parseArgs(argv: string[]): CliOptions {
  const set = new Set(argv)
  return {
    dryRun: set.has('--dry-run'),
    changedOnly: set.has('--changed-only'),
    forceDelete: set.has('--force-delete'),
  }
}

// ============================================================
// Markdown のパース
// ============================================================
/**
 * 本文を「# 問題」「## 選択肢」「## 解説」の各セクションに分割する。
 * 各見出しは行頭完全一致でアンカーする（解説本文中の `##` を誤検知しないため、
 * 既知の見出し行のみをセパレータとして扱う）。
 */
function splitSections(content: string): {
  question: string | null
  choices: string | null
  explanation: string | null
} {
  const text = content.replace(/\r\n/g, '\n')

  const qMatch = text.match(/^#[ \t]+問題[ \t]*$/m)
  const cMatch = text.match(/^##[ \t]+選択肢[ \t]*$/m)
  const eMatch = text.match(/^##[ \t]+解説[ \t]*$/m)

  const qIndex = qMatch?.index
  const cIndex = cMatch?.index
  if (qIndex === undefined || cIndex === undefined) {
    return { question: null, choices: null, explanation: null }
  }

  const qStart = qIndex + qMatch![0].length
  const cStart = cIndex + cMatch![0].length
  const eIndex = eMatch?.index

  const question = text.slice(qStart, cIndex).trim()
  const choices = text
    .slice(cStart, eIndex !== undefined ? eIndex : undefined)
    .trim()
  const explanation =
    eIndex !== undefined
      ? text.slice(eIndex + eMatch![0].length).trim()
      : null

  return { question, choices, explanation }
}

function parseChoices(block: string): ParsedChoice[] {
  const result: ParsedChoice[] = []
  for (const line of block.split('\n')) {
    const m = line.match(CHOICE_LINE_RE)
    if (!m) continue
    const text = m[2].trim()
    if (text.length === 0) continue
    result.push({
      choice_text: text,
      is_correct: m[1].toLowerCase() === 'x',
    })
  }
  return result
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
  return false
}

function coerceOrderIndex(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Markdown 文字列を ParsedQuestion に変換する。
 * フォーマット不正の場合は Error を throw する（呼び出し側でスキップ扱い）。
 */
function parseMarkdown(raw: string, filePath: string): ParsedQuestion {
  const { data, content } = matter(raw)

  const id = String(data.id ?? '').trim()
  const questionSetId = String(data.question_set_id ?? '').trim()

  if (!UUID_RE.test(id)) {
    throw new Error(`frontmatter の id が不正です: "${id}"`)
  }
  if (!UUID_RE.test(questionSetId)) {
    throw new Error(
      `frontmatter の question_set_id が不正です: "${questionSetId}"`
    )
  }

  const { question, choices, explanation } = splitSections(content)
  if (question === null || choices === null) {
    throw new Error('「# 問題」または「## 選択肢」セクションが見つかりません')
  }
  if (question.length === 0) {
    throw new Error('問題文（# 問題）が空です')
  }

  const parsedChoices = parseChoices(choices)
  if (parsedChoices.length === 0) {
    throw new Error('有効な選択肢（- [x] / - [ ]）が 1 件もありません')
  }
  if (!parsedChoices.some((c) => c.is_correct)) {
    // 正解が 1 つも無い問題は不正データとして扱う
    throw new Error('正解の選択肢（- [x]）が 1 件もありません')
  }

  return {
    id,
    question_set_id: questionSetId,
    question_text: question,
    explanation: explanation && explanation.length > 0 ? explanation : null,
    is_multiple_choice: coerceBoolean(data.is_multiple_choice),
    order_index: coerceOrderIndex(data.order_index),
    choices: parsedChoices,
  }
}

// ============================================================
// git diff による差分検知
// ============================================================
interface ChangeSet {
  /** 追加・変更されたファイルの絶対パス */
  changed: string[]
  /** 削除されたファイルから推定した question id (UUID) */
  deletedIds: string[]
}

function runGit(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

/**
 * SYNC_BEFORE_SHA .. SYNC_AFTER_SHA の差分を取得する。
 * ベース SHA が無効（初回 push の 0埋め等）の場合は全 .md を追加扱いにする。
 */
async function detectChanges(
  questionsDir: string,
  beforeSha: string | undefined,
  afterSha: string | undefined
): Promise<ChangeSet> {
  const hasValidBase =
    !!beforeSha && !ZERO_SHA.test(beforeSha) && beforeSha.trim().length > 0

  if (!hasValidBase) {
    console.warn(
      'SYNC_BEFORE_SHA が未設定または無効です。全 Markdown ファイルを対象に同期します。'
    )
    return { changed: await listMarkdownFiles(questionsDir), deletedIds: [] }
  }

  const after = afterSha && afterSha.trim().length > 0 ? afterSha : 'HEAD'

  let output: string
  try {
    // --relative: QUESTIONS_DIR 配下の変更のみ、同ディレクトリ相対で出力
    output = runGit(questionsDir, [
      'diff',
      '--name-status',
      '--relative',
      beforeSha!,
      after,
    ])
  } catch (error) {
    console.warn(
      `git diff に失敗しました（${(error as Error).message.trim()}）。` +
        '全 Markdown ファイルを対象に同期します。'
    )
    return { changed: await listMarkdownFiles(questionsDir), deletedIds: [] }
  }

  const changed: string[] = []
  const deletedIds: string[] = []

  for (const line of output.split('\n')) {
    if (line.trim().length === 0) continue
    const parts = line.split('\t')
    const status = parts[0]?.trim() ?? ''
    // R<score>/C<score> は old=parts[1], new=parts[2]
    const isRenameOrCopy = /^[RC]\d*$/.test(status)
    const oldPath = parts[1]
    const newPath = isRenameOrCopy ? parts[2] : parts[1]

    if (!newPath) continue

    if (status.startsWith('D')) {
      if (extname(oldPath) === '.md') {
        deletedIds.push(basename(oldPath, '.md'))
      }
      continue
    }

    if (extname(newPath) === '.md') {
      changed.push(resolve(questionsDir, newPath))
    }
    // リネーム元は実体が消えるため削除候補としても扱う
    if (status.startsWith('R') && oldPath && extname(oldPath) === '.md') {
      deletedIds.push(basename(oldPath, '.md'))
    }
  }

  // 同一 UUID が「変更」と「削除」の両方に現れるケース
  // （資格 / 問題集フォルダ間の移動。ファイル名 = question id のため
  //  git は rename として検知する）は、問題自体は存在し続ける。
  // --force-delete 時に upsert 直後へ delete が走り消失するのを防ぐため、
  // upsert 対象になっている UUID は削除候補から除外する。
  const changedIds = new Set(changed.map((p) => basename(p, '.md')))
  const filteredDeletedIds = deletedIds.filter((id) => !changedIds.has(id))

  return { changed, deletedIds: filteredDeletedIds }
}

// ============================================================
// Markdown ファイルの再帰探索
// ============================================================
async function listMarkdownFiles(dir: string): Promise<string[]> {
  const result: string[] = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue
      result.push(...(await listMarkdownFiles(full)))
    } else if (entry.isFile() && extname(entry.name) === '.md') {
      result.push(full)
    }
  }
  return result
}

// ============================================================
// Supabase への同期処理
// ============================================================
async function upsertQuestion(
  supabase: SupabaseClient<Database>,
  q: ParsedQuestion,
  options: CliOptions
): Promise<void> {
  if (options.dryRun) {
    console.log(
      `  [dry-run] questions を Upsert: id=${q.id} ` +
        `(選択肢 ${q.choices.length} 件 / multiple=${q.is_multiple_choice} / ` +
        `order_index=${q.order_index ?? 'null'})`
    )
    return
  }

  const questionRow: QuestionInsert = {
    id: q.id,
    question_set_id: q.question_set_id,
    question_text: q.question_text,
    explanation: q.explanation,
    is_multiple_choice: q.is_multiple_choice,
    order_index: q.order_index,
  }

  // 1. questions を id をキーに Upsert
  const { error: upsertError } = await supabase
    .from('questions')
    .upsert(questionRow, { onConflict: 'id' })
  if (upsertError) {
    throw new Error(`questions Upsert 失敗: ${upsertError.message}`)
  }

  // 2. 既存 choices を削除
  const { error: deleteError } = await supabase
    .from('choices')
    .delete()
    .eq('question_id', q.id)
  if (deleteError) {
    throw new Error(`既存 choices 削除失敗: ${deleteError.message}`)
  }

  // 3. choices を INSERT（order_index は出現順）
  const choiceRows: ChoiceInsert[] = q.choices.map((c, index) => ({
    question_id: q.id,
    choice_text: c.choice_text,
    is_correct: c.is_correct,
    order_index: index,
  }))
  const { error: insertError } = await supabase
    .from('choices')
    .insert(choiceRows)
  if (insertError) {
    throw new Error(`choices INSERT 失敗: ${insertError.message}`)
  }
}

async function deleteQuestion(
  supabase: SupabaseClient<Database>,
  id: string,
  options: CliOptions
): Promise<void> {
  if (!UUID_RE.test(id)) {
    throw new Error(`削除対象の id が UUID 形式ではありません: "${id}"`)
  }

  if (options.dryRun) {
    console.log(`  [dry-run] questions / choices を削除: id=${id}`)
    return
  }

  // CASCADE 設定の有無に依存しないよう choices を明示的に削除してから削除
  const { error: choicesError } = await supabase
    .from('choices')
    .delete()
    .eq('question_id', id)
  if (choicesError) {
    throw new Error(`choices 削除失敗: ${choicesError.message}`)
  }

  const { error: questionError } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
  if (questionError) {
    throw new Error(`questions 削除失敗: ${questionError.message}`)
  }
}

// ============================================================
// メイン
// ============================================================
async function main() {
  const options = parseArgs(process.argv.slice(2))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasCredentials = !!supabaseUrl && !!supabaseServiceKey
  if (!hasCredentials && !options.dryRun) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください'
    )
  }
  if (!hasCredentials && options.dryRun) {
    console.warn(
      'Supabase 認証情報が未設定ですが、--dry-run のため DB 接続なしで続行します。'
    )
  }

  const questionsDirInput = process.env.QUESTIONS_DIR || './exported-questions'
  const questionsDir = isAbsolute(questionsDirInput)
    ? questionsDirInput
    : resolve(process.cwd(), questionsDirInput)

  if (!existsSync(questionsDir)) {
    throw new Error(
      `QUESTIONS_DIR が存在しません: ${questionsDir}（QUESTIONS_DIR を確認してください）`
    )
  }

  console.log('=== Birgerik 問題データ同期 ===')
  console.log(`対象ディレクトリ : ${questionsDir}`)
  console.log(
    `モード           : ${options.changedOnly ? '差分のみ (--changed-only)' : '全件'}` +
      `${options.dryRun ? ' / dry-run' : ''}` +
      `${options.forceDelete ? ' / force-delete' : ''}`
  )

  // 対象ファイルと削除候補の決定
  let targetFiles: string[]
  let deletedIds: string[] = []

  if (options.changedOnly) {
    const changes = await detectChanges(
      questionsDir,
      process.env.SYNC_BEFORE_SHA,
      process.env.SYNC_AFTER_SHA
    )
    targetFiles = changes.changed
    deletedIds = changes.deletedIds
  } else {
    targetFiles = await listMarkdownFiles(questionsDir)
  }

  console.log(`対象ファイル数   : ${targetFiles.length}`)
  if (deletedIds.length > 0) {
    console.log(`削除検知         : ${deletedIds.length} 件`)
  }
  console.log('')

  const supabase = createClient<Database>(
    supabaseUrl || 'http://localhost',
    supabaseServiceKey || 'dry-run-placeholder'
  )

  const summary: Summary = {
    upserted: 0,
    deleted: 0,
    skipped: 0,
    errored: 0,
  }

  // --- Upsert 処理 ---
  for (const file of targetFiles) {
    let raw: string
    try {
      raw = await readFile(file, 'utf8')
    } catch (error) {
      console.error(
        `[ERROR] 読み込み失敗: ${file} (${(error as Error).message})`
      )
      summary.errored++
      continue
    }

    let parsed: ParsedQuestion
    try {
      parsed = parseMarkdown(raw, file)
    } catch (error) {
      console.warn(`[SKIP]  ${file}: ${(error as Error).message}`)
      summary.skipped++
      continue
    }

    try {
      await upsertQuestion(supabase, parsed, options)
      if (!options.dryRun) {
        console.log(`[OK]    Upsert: ${parsed.id} (${file})`)
      }
      summary.upserted++
    } catch (error) {
      console.error(
        `[ERROR] 同期失敗: ${file} (${(error as Error).message})`
      )
      summary.errored++
    }
  }

  // --- 削除処理（--force-delete 指定時のみ）---
  if (deletedIds.length > 0) {
    if (!options.forceDelete) {
      console.log(
        `\n削除検知された ${deletedIds.length} 件は --force-delete 未指定のためスキップします。`
      )
    } else {
      for (const id of deletedIds) {
        try {
          await deleteQuestion(supabase, id, options)
          if (!options.dryRun) {
            console.log(`[OK]    削除: ${id}`)
          }
          summary.deleted++
        } catch (error) {
          console.error(
            `[ERROR] 削除失敗: ${id} (${(error as Error).message})`
          )
          summary.errored++
        }
      }
    }
  }

  // --- サマリー ---
  console.log('\n=== 同期結果サマリー ===')
  console.log(`Upsert 成功 : ${summary.upserted} 件`)
  console.log(`削除 成功   : ${summary.deleted} 件`)
  console.log(`スキップ    : ${summary.skipped} 件`)
  console.log(`エラー      : ${summary.errored} 件`)
  if (options.dryRun) {
    console.log('\n(dry-run モードのため DB は更新されていません)')
  }

  // CI で異常を検知できるよう、エラーがあれば終了コード 1
  if (summary.errored > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('同期処理が異常終了しました:', error)
  process.exit(1)
})
