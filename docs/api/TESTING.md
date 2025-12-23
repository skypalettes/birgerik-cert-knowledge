# API テストガイド

このガイドでは、Birgerik Core APIをテストする方法を説明します。

## 前提条件

1. 開発サーバーが起動していること（`pnpm dev`）
2. Supabaseに管理者ユーザーが登録されていること
3. `curl`コマンドが使えること（またはPostman等のRESTクライアント）

## テスト方法

### オプション1: curlコマンドで手動テスト

#### 1. ログインしてトークンを取得

```bash
# Supabaseに登録済みのユーザー情報でログイン
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

成功すると以下のようなレスポンスが返ります：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "your-email@example.com"
  }
}
```

**重要**: トークンをコピーして環境変数に保存：
```bash
export TOKEN="ここにトークンをペースト"
```

#### 2. 認証が必要なエンドポイントをテスト

```bash
# ユーザー情報を取得
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 資格一覧を取得
curl -X GET http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer $TOKEN"

# 資格を作成
curl -X POST http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "テスト資格",
    "description": "APIテスト用の資格"
  }'

# 学習用エンドポイント
curl -X GET http://localhost:3000/api/v1/study/certifications \
  -H "Authorization: Bearer $TOKEN"
```

### オプション2: テストスクリプトを使用

`scripts/test-api.sh`を実行：

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh your-email@example.com your-password
```

### オプション3: Postman/Insomnia

1. Postmanを開く
2. `docs/api/openapi.yaml`をインポート
3. Environment変数を設定：
   - `BASE_URL`: `http://localhost:3000/api/v1`
   - `TOKEN`: ログインで取得したトークン

## テストケース一覧

### 1. 認証テスト

- [ ] ✅ ログイン成功
- [ ] ❌ 無効なメールアドレスでログイン
- [ ] ❌ 間違ったパスワードでログイン
- [ ] ✅ ユーザー情報取得
- [ ] ❌ 無効なトークンでアクセス

### 2. 資格CRUD

- [ ] ✅ 資格一覧取得
- [ ] ✅ 資格作成
- [ ] ✅ 資格詳細取得
- [ ] ✅ 資格更新
- [ ] ✅ 資格削除（問題集がない場合）
- [ ] ❌ 資格削除（問題集がある場合）

### 3. 問題集CRUD

- [ ] ✅ 問題集一覧取得
- [ ] ✅ 問題集作成
- [ ] ✅ 問題集詳細取得
- [ ] ✅ 問題集更新
- [ ] ✅ 問題集削除（問題がない場合）
- [ ] ❌ 問題集削除（問題がある場合）

### 4. 問題CRUD

- [ ] ✅ 問題一覧取得
- [ ] ✅ 問題集でフィルタリング
- [ ] ✅ 問題作成（選択肢含む）
- [ ] ✅ 問題詳細取得
- [ ] ✅ 問題更新
- [ ] ✅ 問題削除

### 5. 学習エンドポイント

- [ ] ✅ 資格＆問題集一覧取得
- [ ] ✅ 問題集詳細取得
- [ ] ✅ 問題一覧取得（選択肢含む）

### 6. エラーハンドリング

- [ ] ❌ 認証なしでアクセス（401）
- [ ] ❌ 存在しないリソース（404）
- [ ] ❌ バリデーションエラー（422）

### 7. キャッシュ

- [ ] ✅ 同じリクエストが2回目は速い
- [ ] ✅ データ更新後キャッシュが無効化される

### 8. CORS

- [ ] ✅ OPTIONSプリフライトリクエスト
- [ ] ✅ CORSヘッダーが含まれる

## トラブルシューティング

### エラー: 401 Unauthorized

```json
{
  "error": "Authorization header is missing or invalid"
}
```

**解決方法**: Authorizationヘッダーが正しく設定されているか確認
```bash
# 正しい形式
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### エラー: 422 Validation Error

```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "email": ["有効なメールアドレスを入力してください"]
  }
}
```

**解決方法**: リクエストボディのバリデーションエラーを確認し、修正する

### エラー: 500 Internal Server Error

サーバーログを確認：
```bash
# 開発サーバーのターミナルでエラーログを確認
```

一般的な原因：
- Supabase接続エラー
- データベーススキーマの不一致
- 環境変数の未設定

### JWT_SECRETが設定されていない

`.env.local`ファイルを作成：
```bash
cp .env.example .env.local
# JWT_SECRETを強力なランダム文字列に設定
```

## パフォーマンステスト

### キャッシュ効果の確認

```bash
# 1回目（キャッシュなし）
time curl -X GET http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer $TOKEN"

# 2回目（キャッシュあり、60秒以内）
time curl -X GET http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer $TOKEN"
```

2回目の方が速いはずです。

### 負荷テスト（オプション）

```bash
# abコマンドで簡易負荷テスト
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/certifications
```

## 次のステップ

- [ ] すべてのテストケースをパス
- [ ] エッジケースのテスト
- [ ] Obsidianプラグインから接続テスト
- [ ] 本番環境でのテスト
