import type {
  GetCertificationsResponse,
  GetQuestionSetResponse,
  GetQuestionsResponse,
  ErrorResponse,
} from '@/types/api'

/**
 * Birgerik REST API クライアント
 *
 * 認証不要・完全オープンなAPIクライアント
 */
export class BirgerikApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 末尾のスラッシュを削除
  }

  /**
   * すべての資格と問題集を取得
   * GET /api/v1/study/certifications
   */
  async getCertifications(): Promise<GetCertificationsResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/study/certifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '資格一覧の取得に失敗しました')
    }

    return await response.json()
  }

  /**
   * 問題集の詳細を取得
   * GET /api/v1/study/question-sets/:id
   */
  async getQuestionSet(questionSetId: string): Promise<GetQuestionSetResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/study/question-sets/${questionSetId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '問題集の取得に失敗しました')
    }

    return await response.json()
  }

  /**
   * 問題集の問題一覧を取得（選択肢を含む）
   * GET /api/v1/study/questions/:questionSetId
   */
  async getQuestions(questionSetId: string): Promise<GetQuestionsResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/study/questions/${questionSetId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '問題一覧の取得に失敗しました')
    }

    return await response.json()
  }

  /**
   * API URLを更新
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  /**
   * API接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCertifications()
      return true
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }
}
