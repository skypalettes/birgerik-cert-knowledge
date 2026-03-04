# Birgerik Obs 実装ドキュメント

> **対象リポジトリ:** `birgerik-obs`（新規作成）
> **役割:** Obsidian プラグイン — 学習・試験アプリケーション
> **プラットフォーム:** Obsidian Desktop / Mobile（TypeScript + Preact + esbuild）
> **参照:** [ARCHITECTURE.md](../ARCHITECTURE.md) / [REQUIREMENTS.md](../REQUIREMENTS.md)

---

## 1. プロジェクト初期セットアップ

### 1.1 リポジトリ作成

Obsidian 公式サンプルをベースにする。

```bash
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git birgerik-obs
cd birgerik-obs
rm -rf .git
git init
```

### 1.2 依存パッケージ

```bash
pnpm init
pnpm add -D typescript esbuild obsidian @types/node builtin-modules
pnpm add preact zustand @birgerik/types
```

### 1.3 `.npmrc`（GitHub Packages 認証）

```ini
@birgerik:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 1.4 `package.json`

```json
{
  "name": "birgerik-obs",
  "version": "1.0.0",
  "description": "Birgerik — Obsidian 学習・試験プラグイン",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  },
  "devDependencies": {
    "@types/node": "^20",
    "builtin-modules": "^3.3.0",
    "esbuild": "^0.21.0",
    "obsidian": "latest",
    "typescript": "^5"
  },
  "dependencies": {
    "@birgerik/types": "^1.0.0",
    "preact": "^10.22.0",
    "zustand": "^4.5.0"
  }
}
```

### 1.5 `esbuild.config.mjs`

```javascript
import esbuild from 'esbuild'
import process from 'process'
import builtins from 'builtin-modules'

const prod = process.argv[2] === 'production'

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins,
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
  // Preact を React として解決
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  },
})

if (prod) {
  await context.rebuild()
  process.exit(0)
} else {
  await context.watch()
}
```

### 1.6 `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2018",
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "lib": ["ES2018", "DOM"],
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

### 1.7 `manifest.json`

```json
{
  "id": "birgerik-obs",
  "name": "Birgerik",
  "version": "1.0.0",
  "minAppVersion": "1.6.0",
  "description": "学習・試験プラグイン（Birgerik エコシステム）",
  "author": "Birgerik",
  "isDesktopOnly": false
}
```

---

## 2. ディレクトリ構成

```
birgerik-obs/
├── src/
│   ├── main.ts                         # プラグインエントリポイント
│   ├── settings.ts                     # プラグイン設定
│   ├── views/
│   │   ├── study-view.ts               # 学習モードビュー（Obsidian ItemView）
│   │   └── exam-view.ts                # 試験モードビュー（Obsidian ItemView）
│   ├── components/
│   │   ├── App.tsx                     # ルートコンポーネント（ビュー切り替え）
│   │   ├── study/
│   │   │   ├── CertificationList.tsx
│   │   │   ├── QuestionSetList.tsx
│   │   │   ├── ModeSelect.tsx
│   │   │   ├── Practice.tsx
│   │   │   ├── ChoiceOption.tsx
│   │   │   ├── AnswerFeedback.tsx
│   │   │   └── StudyResult.tsx
│   │   ├── exam/
│   │   │   ├── ExamList.tsx
│   │   │   ├── ExamConfirm.tsx
│   │   │   ├── ExamSession.tsx
│   │   │   ├── ExamTimer.tsx
│   │   │   ├── ExamNavigator.tsx
│   │   │   └── ExamResult.tsx
│   │   └── shared/
│   │       ├── Spinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── MarkdownRenderer.tsx
│   │       └── ProgressCircle.tsx
│   ├── store/
│   │   ├── study-store.ts              # 学習セッション状態管理
│   │   └── exam-store.ts              # 試験セッション状態管理
│   ├── lib/
│   │   └── api/
│   │       └── client.ts              # Birgerik Core API クライアント
│   └── styles/
│       └── main.css                   # Obsidian CSS 変数を使ったスタイル
├── styles.css                          # Obsidian が読み込む CSS（ビルド出力先）
├── manifest.json
├── versions.json
├── esbuild.config.mjs
├── tsconfig.json
├── .npmrc
└── package.json
```

---

## 3. プラグインエントリポイント（`src/main.ts`）

```typescript
import { Plugin, WorkspaceLeaf } from 'obsidian'
import { BirgerikSettings, DEFAULT_SETTINGS, BirgerikSettingTab } from './settings'
import { StudyView, STUDY_VIEW_TYPE } from './views/study-view'
import { ExamView, EXAM_VIEW_TYPE } from './views/exam-view'

export default class BirgerikPlugin extends Plugin {
  settings!: BirgerikSettings

  async onload() {
    await this.loadSettings()

    // ビュー登録
    this.registerView(STUDY_VIEW_TYPE, (leaf) => new StudyView(leaf, this))
    this.registerView(EXAM_VIEW_TYPE, (leaf) => new ExamView(leaf, this))

    // リボンアイコン（学習）
    this.addRibbonIcon('book-open', 'Birgerik 学習', () => {
      this.activateView(STUDY_VIEW_TYPE)
    })

    // リボンアイコン（試験）
    this.addRibbonIcon('clipboard-check', 'Birgerik 試験', () => {
      this.activateView(EXAM_VIEW_TYPE)
    })

    // コマンド
    this.addCommand({
      id: 'open-study',
      name: '学習モードを開く',
      callback: () => this.activateView(STUDY_VIEW_TYPE),
    })
    this.addCommand({
      id: 'open-exam',
      name: '試験モードを開く',
      callback: () => this.activateView(EXAM_VIEW_TYPE),
    })

    // 設定タブ
    this.addSettingTab(new BirgerikSettingTab(this.app, this))
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(STUDY_VIEW_TYPE)
    this.app.workspace.detachLeavesOfType(EXAM_VIEW_TYPE)
  }

  async activateView(viewType: string) {
    const { workspace } = this.app
    let leaf = workspace.getLeavesOfType(viewType)[0]

    if (!leaf) {
      const newLeaf = workspace.getLeaf('tab')
      await newLeaf.setViewState({ type: viewType, active: true })
      leaf = newLeaf
    }
    workspace.revealLeaf(leaf)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
```

---

## 4. 設定（`src/settings.ts`）

```typescript
import { App, PluginSettingTab, Setting } from 'obsidian'
import type BirgerikPlugin from './main'

export interface BirgerikSettings {
  apiBaseUrl: string
}

export const DEFAULT_SETTINGS: BirgerikSettings = {
  apiBaseUrl: 'https://birgerik-core.vercel.app/api/v1',
}

export class BirgerikSettingTab extends PluginSettingTab {
  plugin: BirgerikPlugin

  constructor(app: App, plugin: BirgerikPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display() {
    const { containerEl } = this
    containerEl.empty()
    containerEl.createEl('h2', { text: 'Birgerik 設定' })

    new Setting(containerEl)
      .setName('API URL')
      .setDesc('Birgerik Core の API ベース URL')
      .addText((text) =>
        text
          .setPlaceholder('https://birgerik-core.vercel.app/api/v1')
          .setValue(this.plugin.settings.apiBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiBaseUrl = value
            await this.plugin.saveSettings()
          })
      )
  }
}
```

---

## 5. Obsidian ItemView（`src/views/`）

### 5.1 学習ビュー（`src/views/study-view.ts`）

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian'
import { render, h } from 'preact'
import { StudyApp } from '../components/study/StudyApp'
import type BirgerikPlugin from '../main'

export const STUDY_VIEW_TYPE = 'birgerik-study'

export class StudyView extends ItemView {
  private plugin: BirgerikPlugin
  private root: HTMLElement | null = null

  constructor(leaf: WorkspaceLeaf, plugin: BirgerikPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType() { return STUDY_VIEW_TYPE }
  getDisplayText() { return 'Birgerik 学習' }
  getIcon() { return 'book-open' }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()
    container.addClass('birgerik-study-view')
    this.root = container

    render(
      h(StudyApp, { apiBaseUrl: this.plugin.settings.apiBaseUrl }),
      container
    )
  }

  async onClose() {
    if (this.root) {
      render(null, this.root)
    }
  }
}
```

### 5.2 試験ビュー（`src/views/exam-view.ts`）

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian'
import { render, h } from 'preact'
import { ExamApp } from '../components/exam/ExamApp'
import type BirgerikPlugin from '../main'

export const EXAM_VIEW_TYPE = 'birgerik-exam'

export class ExamView extends ItemView {
  private plugin: BirgerikPlugin
  private root: HTMLElement | null = null

  constructor(leaf: WorkspaceLeaf, plugin: BirgerikPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType() { return EXAM_VIEW_TYPE }
  getDisplayText() { return 'Birgerik 試験' }
  getIcon() { return 'clipboard-check' }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()
    container.addClass('birgerik-exam-view')
    this.root = container

    render(
      h(ExamApp, { apiBaseUrl: this.plugin.settings.apiBaseUrl }),
      container
    )
  }

  async onClose() {
    if (this.root) {
      render(null, this.root)
    }
  }
}
```

---

## 6. API クライアント（`src/lib/api/client.ts`）

`birgerik-web` の `lib/api/client.ts` とほぼ同一。`next: { revalidate }` を除いたシンプルな `fetch` ラッパー。

```typescript
// src/lib/api/client.ts
import type {
  GetCertificationsResponse,
  GetQuestionSetResponse,
  GetQuestionsResponse,
  GetExamConfigResponse,
} from '@birgerik/types'

let BASE_URL = 'https://birgerik-core.vercel.app/api/v1'

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, '')
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getCertifications(): Promise<GetCertificationsResponse> {
  return apiFetch('/study/certifications')
}

export async function getQuestionSetDetail(id: string): Promise<GetQuestionSetResponse> {
  return apiFetch(`/study/question-sets/${id}`)
}

export async function getQuestions(questionSetId: string): Promise<GetQuestionsResponse> {
  return apiFetch(`/study/questions/${questionSetId}`)
}

export async function getExamConfig(questionSetId: string): Promise<GetExamConfigResponse> {
  return apiFetch(`/study/exams/${questionSetId}`)
}
```

---

## 7. Zustand ストア

`birgerik-web` の `study-store.ts` / `exam-store.ts` をほぼそのまま流用する。

**差異点: ストレージ**

Obsidian プラグインでは `sessionStorage` が利用できない場合があるため、`in-memory` ストアを使用する（セッションはビューを閉じると終了）。

```typescript
// store/study-store.ts の変更点のみ記載

// ❌ birgerik-web（sessionStorage）
persist(
  (set, get) => ({ ... }),
  {
    name: 'birgerik-study-session',
    storage: createJSONStorage(() => sessionStorage),
  }
)

// ✅ birgerik-obs（in-memory: persist ミドルウェアを削除）
create<StudyState & StudyActions>()((set, get) => ({
  ...initialState,
  // ... アクション定義は birgerik-web と同一
}))
```

それ以外の状態・アクション定義は `birgerik-web` と完全に同一。

---

## 8. コンポーネント実装

### 8.1 学習モードルート（`src/components/study/StudyApp.tsx`）

Obsidian にはルーターがないため、内部の `screen` 状態で画面を切り替える。

```tsx
import { useState } from 'preact/hooks'
import { CertificationList } from './CertificationList'
import { QuestionSetList } from './QuestionSetList'
import { ModeSelect } from './ModeSelect'
import { Practice } from './Practice'
import { StudyResult } from './StudyResult'

type Screen =
  | { id: 'cert-list' }
  | { id: 'qs-list'; certId: string; certName: string }
  | { id: 'mode-select'; certId: string; questionSetId: string; questionSetName: string }
  | { id: 'practice'; questionSetId: string; mode: 'sequential' | 'random' | 'review' }
  | { id: 'result'; certId: string; questionSetId: string }

type Props = { apiBaseUrl: string }

export function StudyApp({ apiBaseUrl }: Props) {
  const [screen, setScreen] = useState<Screen>({ id: 'cert-list' })

  const navigate = (next: Screen) => setScreen(next)

  switch (screen.id) {
    case 'cert-list':
      return (
        <CertificationList
          apiBaseUrl={apiBaseUrl}
          onSelect={(certId, certName) => navigate({ id: 'qs-list', certId, certName })}
        />
      )
    case 'qs-list':
      return (
        <QuestionSetList
          apiBaseUrl={apiBaseUrl}
          certId={screen.certId}
          certName={screen.certName}
          onSelect={(questionSetId, questionSetName) =>
            navigate({ id: 'mode-select', certId: screen.certId, questionSetId, questionSetName })
          }
          onBack={() => navigate({ id: 'cert-list' })}
        />
      )
    case 'mode-select':
      return (
        <ModeSelect
          questionSetId={screen.questionSetId}
          questionSetName={screen.questionSetName}
          onSelect={(mode) =>
            navigate({ id: 'practice', questionSetId: screen.questionSetId, mode })
          }
          onBack={() =>
            navigate({
              id: 'qs-list',
              certId: screen.certId,
              certName: '',
            })
          }
        />
      )
    case 'practice':
      return (
        <Practice
          apiBaseUrl={apiBaseUrl}
          questionSetId={screen.questionSetId}
          mode={screen.mode}
          onFinish={() =>
            navigate({ id: 'result', certId: '', questionSetId: screen.questionSetId })
          }
        />
      )
    case 'result':
      return (
        <StudyResult
          questionSetId={screen.questionSetId}
          onReview={() =>
            navigate({ id: 'practice', questionSetId: screen.questionSetId, mode: 'review' })
          }
          onRetry={() =>
            navigate({ id: 'mode-select', certId: screen.certId, questionSetId: screen.questionSetId, questionSetName: '' })
          }
          onHome={() => navigate({ id: 'cert-list' })}
        />
      )
  }
}
```

### 8.2 試験モードルート（`src/components/exam/ExamApp.tsx`）

```tsx
import { useState } from 'preact/hooks'
import { ExamList } from './ExamList'
import { ExamConfirm } from './ExamConfirm'
import { ExamSession } from './ExamSession'
import { ExamResult } from './ExamResult'

type Screen =
  | { id: 'list' }
  | { id: 'confirm'; questionSetId: string }
  | { id: 'session'; questionSetId: string }
  | { id: 'result'; questionSetId: string }

type Props = { apiBaseUrl: string }

export function ExamApp({ apiBaseUrl }: Props) {
  const [screen, setScreen] = useState<Screen>({ id: 'list' })
  const navigate = (next: Screen) => setScreen(next)

  switch (screen.id) {
    case 'list':
      return (
        <ExamList
          apiBaseUrl={apiBaseUrl}
          onSelect={(questionSetId) => navigate({ id: 'confirm', questionSetId })}
        />
      )
    case 'confirm':
      return (
        <ExamConfirm
          apiBaseUrl={apiBaseUrl}
          questionSetId={screen.questionSetId}
          onStart={() => navigate({ id: 'session', questionSetId: screen.questionSetId })}
          onBack={() => navigate({ id: 'list' })}
        />
      )
    case 'session':
      return (
        <ExamSession
          questionSetId={screen.questionSetId}
          onFinish={() => navigate({ id: 'result', questionSetId: screen.questionSetId })}
          onAbandon={() => navigate({ id: 'list' })}
        />
      )
    case 'result':
      return (
        <ExamResult
          questionSetId={screen.questionSetId}
          onRetry={() => navigate({ id: 'confirm', questionSetId: screen.questionSetId })}
          onHome={() => navigate({ id: 'list' })}
        />
      )
  }
}
```

### 8.3 資格一覧（`src/components/study/CertificationList.tsx`）

```tsx
import { useEffect, useState } from 'preact/hooks'
import { getCertifications, setBaseUrl } from '@/lib/api/client'
import type { CertificationWithQuestionSets } from '@birgerik/types'
import { Spinner } from '../shared/Spinner'

type Props = {
  apiBaseUrl: string
  onSelect: (certId: string, certName: string) => void
}

export function CertificationList({ apiBaseUrl, onSelect }: Props) {
  const [certs, setCerts] = useState<CertificationWithQuestionSets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBaseUrl(apiBaseUrl)
    getCertifications()
      .then(({ certifications }) => setCerts(certifications))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [apiBaseUrl])

  if (loading) return <Spinner />
  if (error) return <p class="birgerik-error">エラー: {error}</p>
  if (certs.length === 0) return <p class="birgerik-empty">資格がありません</p>

  return (
    <div class="birgerik-list">
      <h2 class="birgerik-heading">資格を選択</h2>
      {certs.map((cert) => (
        <button
          key={cert.id}
          class="birgerik-card"
          onClick={() => onSelect(cert.id, cert.name)}
        >
          <span class="birgerik-card-title">{cert.name}</span>
          {cert.description && (
            <span class="birgerik-card-desc">{cert.description}</span>
          )}
          <span class="birgerik-card-meta">{cert.question_sets.length} 問題集</span>
        </button>
      ))}
    </div>
  )
}
```

### 8.4 問題実施（`src/components/study/Practice.tsx`）

`birgerik-web` の `PracticePage` をコンポーネントとして再実装。
Obsidian 向けの差異:
- `useRouter` → 不使用（`onFinish` コールバックに置き換え）
- `useSearchParams` → `mode` プロパティとして受け取る

```tsx
import { useEffect } from 'preact/hooks'
import { useStudyStore } from '@/store/study-store'
import { getQuestions, getQuestionSetDetail, setBaseUrl } from '@/lib/api/client'
import { QuestionDisplay } from './QuestionDisplay'
import { ChoiceOption } from './ChoiceOption'
import { AnswerFeedback } from './AnswerFeedback'

type Props = {
  apiBaseUrl: string
  questionSetId: string
  mode: 'sequential' | 'random' | 'review'
  onFinish: () => void
}

export function Practice({ apiBaseUrl, questionSetId, mode, onFinish }: Props) {
  const store = useStudyStore()

  useEffect(() => {
    if (store.isSessionActive && store.questionSetId === questionSetId) return

    setBaseUrl(apiBaseUrl)
    Promise.all([
      getQuestionSetDetail(questionSetId),
      getQuestions(questionSetId),
    ]).then(([{ question_set }, { questions }]) => {
      store.startSession({
        questionSetId,
        questionSetName: question_set.name,
        certificationName: question_set.certification_name,
        questions,
        mode,
      })
    })
  }, [questionSetId, mode])

  const question = store.getCurrentQuestion()
  if (!question) return <div class="birgerik-loading">読み込み中...</div>

  const progress = store.getProgress()

  return (
    <div class="birgerik-practice">
      {/* プログレスバー */}
      <div class="birgerik-progress-bar-wrapper">
        <div class="birgerik-progress-bar" style={{ width: `${progress.percentage}%` }} />
        <span class="birgerik-progress-text">{progress.current} / {progress.total}</span>
      </div>

      {/* 問題文 */}
      <QuestionDisplay question={question} />

      {/* 選択肢 */}
      <div class="birgerik-choices">
        {question.choices.map((choice) => (
          <ChoiceOption
            key={choice.id}
            choice={choice}
            isSelected={store.selectedChoiceIds.includes(choice.id)}
            isSubmitted={store.isAnswerSubmitted}
            onToggle={() => store.toggleChoice(choice.id, question.is_multiple_choice)}
          />
        ))}
      </div>

      {/* 解答フィードバック */}
      {store.isAnswerSubmitted && (
        <AnswerFeedback
          isCorrect={store.answerHistory.at(-1)?.isCorrect ?? false}
          explanation={question.explanation}
          showExplanation={store.showExplanation}
          onToggleExplanation={store.toggleExplanation}
        />
      )}

      {/* ナビゲーション */}
      <div class="birgerik-nav">
        {!store.isAnswerSubmitted && (
          <button
            class="birgerik-btn-primary"
            onClick={store.submitAnswer}
            disabled={store.selectedChoiceIds.length === 0}
          >
            回答する
          </button>
        )}
        {store.isAnswerSubmitted && !store.isLastQuestion() && (
          <button class="birgerik-btn-primary" onClick={store.nextQuestion}>
            次の問題
          </button>
        )}
        {store.isAnswerSubmitted && store.isLastQuestion() && (
          <button class="birgerik-btn-success" onClick={onFinish}>
            結果を見る
          </button>
        )}
        {store.isAnswerSubmitted && (
          <button class="birgerik-btn-ghost" onClick={store.previousQuestion} disabled={store.isFirstQuestion()}>
            前の問題
          </button>
        )}
      </div>
    </div>
  )
}
```

### 8.5 試験タイマー（`src/components/exam/ExamTimer.tsx`）

`birgerik-web` から移植（JSX のみ変更）。

```tsx
import { useMemo } from 'preact/hooks'

type Props = { seconds: number }

export function ExamTimer({ seconds }: Props) {
  const { minutes, secs, isCritical, isWarning } = useMemo(() => ({
    minutes: Math.floor(seconds / 60),
    secs: seconds % 60,
    isCritical: seconds <= 60,
    isWarning: seconds <= 300,
  }), [seconds])

  const cls = isCritical
    ? 'birgerik-timer birgerik-timer--critical'
    : isWarning
    ? 'birgerik-timer birgerik-timer--warning'
    : 'birgerik-timer'

  return (
    <span class={cls}>
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
```

### 8.6 Markdown レンダラー（`src/components/shared/MarkdownRenderer.tsx`）

Obsidian の組み込み `MarkdownRenderer` を利用する。

```tsx
import { useEffect, useRef } from 'preact/hooks'
import { MarkdownRenderer as ObsidianMD, App } from 'obsidian'

// コンテキスト経由で App インスタンスを受け取る（後述）
type Props = { markdown: string; app: App }

export function MarkdownRenderer({ markdown, app }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.empty()
    ObsidianMD.render(app, markdown, ref.current, '', null as any)
  }, [markdown])

  return <div ref={ref} class="birgerik-markdown" />
}
```

> **Note:** `App` インスタンスは Preact Context 経由で渡す（`main.ts` → View → App → コンポーネント）。
> ```tsx
> // src/components/AppContext.ts
> import { createContext } from 'preact'
> import type { App } from 'obsidian'
> export const AppContext = createContext<App | null>(null)
> ```

---

## 9. スタイリング（`src/styles/main.css`）

Obsidian の CSS 変数を使用することでテーマ（ライト/ダーク）に自動対応する。

```css
/* ==========================================
   Birgerik Obsidian Plugin Styles
   Obsidian CSS 変数を使用（テーマ自動対応）
   ========================================== */

/* --- レイアウト --- */
.birgerik-study-view,
.birgerik-exam-view {
  padding: var(--size-4-4);
  overflow-y: auto;
  height: 100%;
}

.birgerik-heading {
  font-size: var(--font-ui-large);
  font-weight: var(--font-semibold);
  color: var(--text-normal);
  margin-bottom: var(--size-4-3);
}

/* --- カード --- */
.birgerik-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
  padding: var(--size-4-3) var(--size-4-4);
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--radius-m);
  cursor: pointer;
  transition: background 0.15s ease;
  margin-bottom: var(--size-4-2);
}

.birgerik-card:hover {
  background: var(--background-modifier-hover);
}

.birgerik-card-title {
  font-size: var(--font-ui-medium);
  font-weight: var(--font-semibold);
  color: var(--text-normal);
}

.birgerik-card-desc {
  font-size: var(--font-ui-small);
  color: var(--text-muted);
}

.birgerik-card-meta {
  font-size: var(--font-ui-smaller);
  color: var(--text-accent);
}

/* --- ボタン --- */
.birgerik-btn-primary {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: var(--radius-m);
  padding: var(--size-4-2) var(--size-4-4);
  font-size: var(--font-ui-medium);
  cursor: pointer;
  transition: background 0.15s ease;
}

.birgerik-btn-primary:hover {
  background: var(--interactive-accent-hover);
}

.birgerik-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.birgerik-btn-success {
  background: var(--color-green);
  color: white;
  border: none;
  border-radius: var(--radius-m);
  padding: var(--size-4-2) var(--size-4-4);
  font-size: var(--font-ui-medium);
  cursor: pointer;
}

.birgerik-btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--radius-m);
  padding: var(--size-4-2) var(--size-4-4);
  font-size: var(--font-ui-medium);
  cursor: pointer;
}

.birgerik-btn-danger {
  background: var(--color-red);
  color: white;
  border: none;
  border-radius: var(--radius-m);
  padding: var(--size-4-2) var(--size-4-4);
  font-size: var(--font-ui-medium);
  cursor: pointer;
}

/* --- 練習画面 --- */
.birgerik-practice {
  max-width: 640px;
  margin: 0 auto;
}

.birgerik-progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--size-4-2);
  margin-bottom: var(--size-4-4);
}

.birgerik-progress-bar {
  height: 6px;
  background: var(--interactive-accent);
  border-radius: 9999px;
  transition: width 0.3s ease;
  flex: 1;
}

.birgerik-progress-text {
  font-size: var(--font-ui-smaller);
  color: var(--text-muted);
  white-space: nowrap;
}

/* --- 選択肢 --- */
.birgerik-choice {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--size-4-3);
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--radius-m);
  background: var(--background-primary);
  color: var(--text-normal);
  cursor: pointer;
  margin-bottom: var(--size-4-2);
  transition: background 0.1s, border-color 0.1s;
}

.birgerik-choice:hover:not(:disabled) {
  background: var(--background-modifier-hover);
}

.birgerik-choice--selected {
  border-color: var(--interactive-accent);
  background: var(--background-modifier-hover);
}

.birgerik-choice--correct {
  border-color: var(--color-green);
  background: rgba(var(--color-green-rgb), 0.1);
}

.birgerik-choice--incorrect {
  border-color: var(--color-red);
  background: rgba(var(--color-red-rgb), 0.1);
}

/* --- フィードバック --- */
.birgerik-feedback {
  padding: var(--size-4-3);
  border-radius: var(--radius-m);
  margin-bottom: var(--size-4-3);
}

.birgerik-feedback--correct {
  background: rgba(var(--color-green-rgb), 0.1);
  border: 1px solid var(--color-green);
}

.birgerik-feedback--incorrect {
  background: rgba(var(--color-red-rgb), 0.1);
  border: 1px solid var(--color-red);
}

/* --- 試験タイマー --- */
.birgerik-timer {
  font-family: var(--font-monospace);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-normal);
}

.birgerik-timer--warning {
  color: var(--color-orange);
}

.birgerik-timer--critical {
  color: var(--color-red);
  animation: birgerik-pulse 1s infinite;
}

@keyframes birgerik-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* --- 試験ナビゲーター --- */
.birgerik-exam-navigator {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--size-4-3);
}

.birgerik-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-s);
  border: 1px solid var(--background-modifier-border);
  background: var(--background-secondary);
  color: var(--text-muted);
  font-size: var(--font-ui-smaller);
  cursor: pointer;
}

.birgerik-nav-btn--current {
  border-color: var(--interactive-accent);
  color: var(--interactive-accent);
  font-weight: bold;
}

.birgerik-nav-btn--answered {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-color: var(--interactive-accent);
}

/* --- 結果 --- */
.birgerik-result {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  padding: var(--size-4-4);
}

.birgerik-result-pass {
  color: var(--color-green);
}

.birgerik-result-fail {
  color: var(--color-red);
}

.birgerik-result-score {
  font-size: 3rem;
  font-weight: 900;
  margin: var(--size-4-3) 0;
}

.birgerik-result-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--size-4-2);
  margin: var(--size-4-4) 0;
}

.birgerik-stat {
  background: var(--background-secondary);
  border-radius: var(--radius-m);
  padding: var(--size-4-3);
}

.birgerik-stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-normal);
}

.birgerik-stat-label {
  font-size: var(--font-ui-smaller);
  color: var(--text-muted);
}

/* --- 共通 --- */
.birgerik-nav {
  display: flex;
  gap: var(--size-4-2);
  margin-top: var(--size-4-4);
  flex-wrap: wrap;
}

.birgerik-error {
  color: var(--color-red);
  padding: var(--size-4-3);
}

.birgerik-empty {
  color: var(--text-muted);
  text-align: center;
  padding: var(--size-4-6);
}

.birgerik-loading {
  display: flex;
  justify-content: center;
  padding: var(--size-4-6);
  color: var(--text-muted);
}

.birgerik-markdown {
  font-size: var(--font-ui-medium);
  line-height: 1.6;
}

.birgerik-markdown code {
  background: var(--code-background);
  padding: 2px 4px;
  border-radius: var(--radius-s);
  font-family: var(--font-monospace);
}
```

---

## 10. コンポーネント対応表

| 画面 | コンポーネント | `birgerik-web` との対応 |
|------|--------------|----------------------|
| 資格一覧 | `CertificationList` | `/study` ページに相当 |
| 問題集一覧 | `QuestionSetList` | `/study/[certId]` ページに相当 |
| モード選択 | `ModeSelect` | `/study/.../mode-select` ページに相当 |
| 学習実施 | `Practice` | `/study/.../practice` ページに相当 |
| 学習結果 | `StudyResult` | `/study/.../result` ページに相当 |
| 試験一覧 | `ExamList` | `/exam` ページに相当 |
| 試験確認 | `ExamConfirm` | `/exam/[setId]/confirm` ページに相当 |
| 試験実施 | `ExamSession` | `/exam/[setId]/session` ページに相当 |
| 試験結果 | `ExamResult` | `/exam/[setId]/result` ページに相当 |

---

## 11. birgerik-web との差異まとめ

| 項目 | birgerik-web | birgerik-obs |
|------|-------------|-------------|
| フレームワーク | React (Next.js) | Preact |
| ルーティング | Next.js App Router | 内部 `screen` 状態で切り替え |
| スタイリング | Tailwind CSS | Obsidian CSS 変数（テーマ対応） |
| Markdown | `react-markdown` | Obsidian 組み込み `MarkdownRenderer` |
| セッション保持 | `sessionStorage` (persist) | in-memory（ビュー閉鎖でリセット） |
| データ取得 | `next: { revalidate }` 付き fetch | 通常 fetch |
| エントリポイント | `app/page.tsx` | `main.ts` (Plugin クラス) |

---

## 12. 実装順序

### Phase 1: プロジェクト基盤

1. リポジトリ作成 + 依存パッケージインストール
2. `esbuild.config.mjs` + `tsconfig.json`
3. `manifest.json` 設定
4. `src/main.ts` — プラグインエントリポイント
5. `src/settings.ts` — 設定 + 設定タブ
6. `src/lib/api/client.ts` — API クライアント
7. Obsidian 開発環境に配置（シンボリックリンクまたはコピー）して動作確認

### Phase 2: 学習モード

8. `src/store/study-store.ts` — ストア（in-memory 版）
9. `StudyView` + `StudyApp` — ビュー + ルーター
10. `CertificationList` → `QuestionSetList` → `ModeSelect`
11. `Practice` + `QuestionDisplay` + `ChoiceOption` + `AnswerFeedback`
12. `StudyResult`
13. 動作確認

### Phase 3: 試験モード

14. `src/store/exam-store.ts` — ストア（in-memory 版）
15. `ExamView` + `ExamApp`
16. `ExamList` → `ExamConfirm` → `ExamSession` + `ExamTimer` + `ExamNavigator`
17. `ExamResult`
18. タイマー動作確認

### Phase 4: スタイリング・仕上げ

19. `src/styles/main.css` — Obsidian CSS 変数でスタイリング
20. `MarkdownRenderer` — Obsidian 組み込み利用
21. Mobile 表示確認
22. ビルド（`pnpm build`）して `main.js` 生成確認

---

## 13. 開発環境セットアップ

Obsidian プラグインをローカルで開発するには、Vault の `.obsidian/plugins/birgerik-obs/` にファイルを配置する。

```bash
# 開発時：Vault のプラグインディレクトリをシンボリックリンク
ln -s /path/to/birgerik-obs /path/to/vault/.obsidian/plugins/birgerik-obs

# ファイル監視ビルド開始
pnpm dev
```

Obsidian の「設定 → コミュニティプラグイン → インストール済みプラグイン」から `Birgerik` を有効化する。

---

## 14. 環境変数（ビルド時）

| 変数名 | 用途 |
|--------|------|
| `GITHUB_TOKEN` | `@birgerik/types` の GitHub Packages 認証（`.npmrc`） |

プラグイン実行時の API URL は Obsidian 設定画面（`BirgerikSettingTab`）で変更可能。

---

*作成日: 2026-02-19*
*対象バージョン: Birgerik v1.0.0*
