# Birgerik Study - Obsidian Plugin

Obsidian内で資格試験の問題演習を行うプラグインです。AWS認定試験、応用情報技術者試験などの問題を学習できます。

## 機能

- 📚 資格一覧の閲覧
- 📝 問題セットの選択
- ✅ 問題の回答と正誤判定
- 📊 学習結果の表示
- 🌐 Birgerik REST APIとの連携

## インストール方法

### 開発版（手動インストール）

1. このリポジトリをクローン

```bash
git clone https://github.com/irunadev/birgerik.git
cd birgerik/birgerik-obsidian
```

2. 依存関係をインストール

```bash
pnpm install
```

3. ビルド

```bash
pnpm build
```

4. Obsidianのプラグインディレクトリにコピーまたはシンボリックリンクを作成

```bash
# macOS/Linux
ln -s $(pwd) ~/path/to/your/vault/.obsidian/plugins/birgerik-obsidian

# Windows
mklink /D "C:\path\to\your\vault\.obsidian\plugins\birgerik-obsidian" "C:\path\to\birgerik\birgerik-obsidian"
```

5. Obsidianを再起動し、設定 > コミュニティプラグインで「Birgerik Study」を有効化

### Obsidianコミュニティプラグイン（近日公開予定）

Obsidianのコミュニティプラグインストアから「Birgerik Study」を検索してインストール

## 使い方

### 基本的な使い方

1. **コマンドパレットから起動**
   - `Ctrl/Cmd + P` でコマンドパレットを開く
   - 「Birgerik: 学習を開始」を選択

2. **リボンアイコンから起動**
   - 左サイドバーの卒業帽アイコン（🎓）をクリック

3. **資格を選択**
   - 表示される資格一覧から学習したい資格を選択

4. **問題セットを選択**
   - 資格内の問題セットをクリックして学習開始（Phase 2で実装予定）

### 設定

設定 > Birgerik Study で以下の項目を設定できます：

- **API URL**: Birgerik APIのベースURL（デフォルト: https://birgerik.vercel.app）
- **接続テスト**: APIに接続できるか確認

## 開発

### 開発環境のセットアップ

```bash
# 依存関係をインストール
pnpm install

# 開発モード（ホットリロード）
pnpm dev
```

### プロジェクト構成

```
birgerik-obsidian/
├── src/
│   ├── main.ts              # プラグインエントリーポイント
│   ├── settings.ts          # プラグイン設定
│   ├── api/
│   │   └── client.ts        # REST APIクライアント
│   ├── views/
│   │   └── study-view.ts    # メイン学習画面
│   ├── components/          # UIコンポーネント（Phase 2）
│   ├── store/               # 状態管理（Phase 2）
│   └── types/
│       └── api.ts           # API型定義
├── styles.css               # スタイルシート
├── manifest.json            # プラグインマニフェスト
└── package.json             # 依存関係
```

### ビルド

```bash
# 本番ビルド
pnpm build

# 型チェック
pnpm run build  # これが型チェックも含む
```

## Phase 1 完了項目 ✓

- [x] プロジェクトセットアップ（Obsidian Plugin Template）
- [x] REST APIクライアント実装（fetch wrapper）
- [x] 型定義のコピー
- [x] 基本的なView表示
- [x] プラグイン設定（API URL）
- [x] 資格一覧の表示
- [x] 問題セット一覧の表示

## Phase 2 予定項目

- [ ] Preactコンポーネントの導入
- [ ] 学習画面の実装（問題表示・回答）
- [ ] 正誤判定と解説表示
- [ ] 結果画面
- [ ] Zustand状態管理
- [ ] モバイル対応UI
- [ ] ローディング状態
- [ ] エラーハンドリング

## 技術スタック

- **TypeScript**: 型安全な開発
- **Preact**: 軽量UIフレームワーク（3KB）
- **Zustand**: 軽量状態管理
- **esbuild**: 高速ビルドツール
- **Obsidian API**: プラグイン基盤

## ライセンス

MIT

## リンク

- [Birgerik Web版](https://birgerik.vercel.app)
- [GitHub Issues](https://github.com/irunadev/birgerik/issues)

## 貢献

バグ報告や機能要望は[GitHub Issues](https://github.com/irunadev/birgerik/issues)までお願いします。
