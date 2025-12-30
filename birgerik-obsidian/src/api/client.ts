import type {
  GetCertificationsResponse,
  GetQuestionSetResponse,
  GetQuestionsResponse,
  ErrorResponse,
} from '@/types/api'
import type { AuthService } from '../services/auth-service'

/**
 * Birgerik REST API クライアント
 *
 * Supabase認証を使用した認証済みAPIクライアント
 */
export class BirgerikApiClient {
  private baseUrl: string
  private authService: AuthService

  constructor(baseUrl: string, authService: AuthService) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 末尾のスラッシュを削除
    this.authService = authService
  }

  /**
   * 認証付きリクエスト
   */
  private async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.authService.getValidAccessToken()

    if (!token) {
      throw new Error('ログインが必要です。設定画面からログインしてください。')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    // 401エラーの場合は再認証を促す
    if (response.status === 401) {
      await this.authService.logout()
      throw new Error('認証に失敗しました。再度ログインしてください。')
    }

    return response
  }

  /**
   * すべての資格と問題集を取得
   * GET /api/v1/study/certifications
   */
  async getCertifications(): Promise<GetCertificationsResponse> {
    const response = await this.authenticatedFetch(
      `${this.baseUrl}/api/v1/study/certifications`,
      { method: 'GET' }
    )

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '資格一覧の取得に失敗しました')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * 問題集の詳細を取得
   * GET /api/v1/study/question-sets/:id
   */
  async getQuestionSet(questionSetId: string): Promise<GetQuestionSetResponse> {
    const response = await this.authenticatedFetch(
      `${this.baseUrl}/api/v1/study/question-sets/${questionSetId}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '問題集の取得に失敗しました')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * 問題集の問題一覧を取得（選択肢を含む）
   * GET /api/v1/study/questions/:questionSetId
   */
  async getQuestions(questionSetId: string): Promise<GetQuestionsResponse> {
    const response = await this.authenticatedFetch(
      `${this.baseUrl}/api/v1/study/questions/${questionSetId}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.error || '問題一覧の取得に失敗しました')
    }

    const result = await response.json()
    return result.data
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
