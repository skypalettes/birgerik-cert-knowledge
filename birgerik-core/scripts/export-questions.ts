import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Database } from '../src/lib/types/database.types'

type PublicTable = keyof Database['public']['Tables']

const PAGE_SIZE = 1000

async function fetchAll<T>(
  supabase: SupabaseClient<Database>,
  table: PublicTable
): Promise<T[]> {
  const result: T[] = []
  let from = 0
  for (;;) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase.from(table).select('*').range(from, to)
    if (error) throw error
    if (!data || data.length === 0) break
    result.push(...(data as T[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return result
}

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

type Certification = Database['public']['Tables']['certifications']['Row']
type QuestionSet = Database['public']['Tables']['question_sets']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type Choice = Database['public']['Tables']['choices']['Row']

const OUTPUT_DIR = resolve(process.cwd(), 'exported-questions')

const INVALID_PATH_CHARS = /[\\/:*?"<>|\x00-\x1f]/g

function sanitizePathSegment(name: string): string {
  const trimmed = name.trim().replace(INVALID_PATH_CHARS, '_')
  return trimmed.length === 0 ? '_' : trimmed
}

function normalizeChoiceText(text: string): string {
  return text.replace(/\r?\n/g, ' ').trim()
}

function buildMarkdown(params: {
  question: Question
  certificationName: string
  questionSetName: string
  choices: Choice[]
}): string {
  const { question, certificationName, questionSetName, choices } = params

  const frontmatterLines = [
    '---',
    `id: "${question.id}"`,
    `question_set_id: "${question.question_set_id}"`,
    `certification: ${JSON.stringify(certificationName)}`,
    `question_set: ${JSON.stringify(questionSetName)}`,
    `is_multiple_choice: ${question.is_multiple_choice ? 'true' : 'false'}`,
  ]
  if (question.order_index !== null && question.order_index !== undefined) {
    frontmatterLines.push(`order_index: ${question.order_index}`)
  }
  frontmatterLines.push('---')
  const frontmatter = frontmatterLines.join('\n')

  const sortedChoices = [...choices].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  )

  const choiceLines = sortedChoices
    .map((c) => `- [${c.is_correct ? 'x' : ' '}] ${normalizeChoiceText(c.choice_text)}`)
    .join('\n')

  const sections = [
    frontmatter,
    '',
    '# 問題',
    question.question_text.trim(),
    '',
    '## 選択肢',
    choiceLines,
    '',
    '## 解説',
    (question.explanation ?? '').trim(),
    '',
  ]

  return sections.join('\n')
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  console.log('資格データを取得中...')
  const certifications = await fetchAll<Certification>(supabase, 'certifications')

  console.log('問題集データを取得中...')
  const questionSets = await fetchAll<QuestionSet>(supabase, 'question_sets')

  console.log('問題データを取得中...')
  const questions = await fetchAll<Question>(supabase, 'questions')

  console.log('選択肢データを取得中...')
  const choices = await fetchAll<Choice>(supabase, 'choices')
  console.log(`  → 問題: ${questions.length} 件 / 選択肢: ${choices.length} 件`)

  const certById = new Map<string, Certification>(
    certifications.map((c) => [c.id, c])
  )
  const setById = new Map<string, QuestionSet>(
    questionSets.map((s) => [s.id, s])
  )
  const choicesByQuestionId = new Map<string, Choice[]>()
  for (const choice of choices) {
    const arr = choicesByQuestionId.get(choice.question_id) ?? []
    arr.push(choice)
    choicesByQuestionId.set(choice.question_id, arr)
  }

  await rm(OUTPUT_DIR, { recursive: true, force: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  let exportedCount = 0
  let skippedCount = 0

  for (const question of questions) {
    const set = setById.get(question.question_set_id)
    if (!set) {
      console.warn(`問題 ${question.id} の問題集 (${question.question_set_id}) が見つかりません。スキップします。`)
      skippedCount++
      continue
    }
    const cert = certById.get(set.certification_id)
    if (!cert) {
      console.warn(`問題集 ${set.id} の資格 (${set.certification_id}) が見つかりません。スキップします。`)
      skippedCount++
      continue
    }

    const certDir = sanitizePathSegment(cert.name)
    const setDir = sanitizePathSegment(set.name)
    const dir = join(OUTPUT_DIR, certDir, setDir)
    await mkdir(dir, { recursive: true })

    const markdown = buildMarkdown({
      question,
      certificationName: cert.name,
      questionSetName: set.name,
      choices: choicesByQuestionId.get(question.id) ?? [],
    })

    await writeFile(join(dir, `${question.id}.md`), markdown, 'utf8')
    exportedCount++
  }

  console.log(`\n完了: ${exportedCount} 件の問題を出力しました (スキップ: ${skippedCount} 件)`)
  console.log(`出力先: ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error('エクスポートに失敗しました:', error)
  process.exit(1)
})
