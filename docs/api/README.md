# Birgerik Core API ドキュメント

Birgerik Core REST API v1 のドキュメントです。

## API概要

- **ベースURL（開発）**: `http://localhost:3000/api/v1`
- **ベースURL（本番）**: `https://your-domain.vercel.app/api/v1`
- **認証方式**: JWT (Bearer Token)
- **データ形式**: JSON
- **キャッシュ**: 60秒（GETエンドポイント）

## 認証

### 1. ログイン

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

レスポンス:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### 2. 認証が必要なリクエスト

取得したトークンを`Authorization`ヘッダーに含めます：

```bash
curl -X GET http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## エンドポイント一覧

### 認証
- `POST /auth/login` - ログイン
- `GET /auth/me` - ユーザー情報取得

### 資格管理
- `GET /certifications` - 資格一覧取得
- `POST /certifications` - 資格作成
- `GET /certifications/{id}` - 資格詳細取得
- `PUT /certifications/{id}` - 資格更新
- `DELETE /certifications/{id}` - 資格削除

### 問題集管理
- `GET /question-sets` - 問題集一覧取得
- `POST /question-sets` - 問題集作成
- `GET /question-sets/{id}` - 問題集詳細取得
- `PUT /question-sets/{id}` - 問題集更新
- `DELETE /question-sets/{id}` - 問題集削除

### 問題管理
- `GET /questions?question_set_id={id}` - 問題一覧取得
- `POST /questions` - 問題作成
- `GET /questions/{id}` - 問題詳細取得
- `PUT /questions/{id}` - 問題更新
- `DELETE /questions/{id}` - 問題削除

### 学習用エンドポイント
- `GET /study/certifications` - 学習用資格一覧（問題集を含む）
- `GET /study/question-sets/{id}` - 学習用問題集詳細
- `GET /study/questions/{questionSetId}` - 学習用問題一覧

## 使用例

### 資格を作成

```bash
curl -X POST http://localhost:3000/api/v1/certifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AWS Certified Solutions Architect",
    "description": "AWS認定ソリューションアーキテクト"
  }'
```

### 問題集を作成

```bash
curl -X POST http://localhost:3000/api/v1/question-sets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "基礎問題集",
    "description": "AWS基礎知識を確認する問題集",
    "certification_id": "certification-uuid-here"
  }'
```

### 問題を作成

```bash
curl -X POST http://localhost:3000/api/v1/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "AWSのストレージサービスはどれですか？",
    "explanation": "S3はAWSのオブジェクトストレージサービスです",
    "is_multiple_choice": false,
    "question_set_id": "question-set-uuid-here",
    "choices": [
      {
        "choice_text": "Amazon S3",
        "is_correct": true
      },
      {
        "choice_text": "Amazon RDS",
        "is_correct": false
      }
    ]
  }'
```

### 学習用データを取得

```bash
# 資格と問題集の一覧を取得
curl -X GET http://localhost:3000/api/v1/study/certifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# 問題集の問題一覧を取得
curl -X GET http://localhost:3000/api/v1/study/questions/{questionSetId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## エラーレスポンス

### 認証エラー (401)
```json
{
  "error": "Invalid or expired token"
}
```

### バリデーションエラー (422)
```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "email": ["有効なメールアドレスを入力してください"],
    "password": ["パスワードは6文字以上である必要があります"]
  }
}
```

### リソースが見つからない (404)
```json
{
  "error": "Resource not found"
}
```

## OpenAPI仕様書

詳細なAPI仕様は[OpenAPI仕様書](./openapi.yaml)を参照してください。

### Swagger UIで閲覧

1. Swagger Editorを開く: https://editor.swagger.io/
2. `openapi.yaml`の内容をコピー＆ペースト
3. 右側のパネルでドキュメントを閲覧

または、以下のコマンドでローカルでSwagger UIを起動できます：

```bash
# swagger-uiをインストール（初回のみ）
npm install -g swagger-ui-watcher

# Swagger UIを起動
swagger-ui-watcher docs/api/openapi.yaml
```

## CORS設定

APIはCORSに対応しています。環境変数でオリジンを指定できます：

```bash
# .env.local
CORS_ORIGIN=https://your-obsidian-plugin-domain.com
```

デフォルトでは`*`（すべてのオリジンを許可）に設定されています。

## レート制限とキャッシュ

- すべてのGETエンドポイントは60秒間キャッシュされます
- キャッシュはNext.jsの`unstable_cache`を使用
- データ更新時（POST/PUT/DELETE）は関連するキャッシュが自動的に無効化されます

## セキュリティ

- すべてのエンドポイントはJWT認証が必要（`/auth/login`を除く）
- JWTトークンの有効期限は7日間
- パスワードは最低6文字以上
- 環境変数`JWT_SECRET`でシークレットキーを設定してください

```bash
# .env.local
JWT_SECRET=your-super-secret-key-here
```

## Obsidianプラグインでの使用

Obsidianプラグインから使用する場合の例：

```typescript
// ログイン
const loginResponse = await fetch('https://your-domain.vercel.app/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
  }),
})

const { token } = await loginResponse.json()

// 資格一覧を取得
const certificationsResponse = await fetch('https://your-domain.vercel.app/api/v1/study/certifications', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const { certifications } = await certificationsResponse.json()
```

## サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。
