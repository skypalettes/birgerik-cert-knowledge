import { Notice } from 'obsidian'
import type { BirgerikSettings } from '../settings'

/**
 * 認証サービス
 * Supabase認証を使用したログイン/ログアウト/トークンリフレッシュを管理
 */
export class AuthService {
  constructor(
    private settings: BirgerikSettings,
    private saveSettings: () => Promise<void>
  ) {}

  /**
   * メール/パスワードでログイン
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.settings.apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ログインに失敗しました')
      }

      const data = await response.json()

      // Supabaseトークンを保存（パスワードは保存しない）
      this.settings.auth = {
        accessToken: data.data.supabase.access_token,
        refreshToken: data.data.supabase.refresh_token,
        expiresAt: Date.now() + data.data.supabase.expires_in * 1000,
        userEmail: email,
      }

      await this.saveSettings()

      new Notice('ログインしました')
      return true
    } catch (error) {
      console.error('Login error:', error)
      new Notice(`ログイン失敗: ${error.message}`)
      return false
    }
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    this.settings.auth = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userEmail: null,
    }
    await this.saveSettings()
    new Notice('ログアウトしました')
  }

  /**
   * ログイン状態を確認
   */
  isLoggedIn(): boolean {
    return !!this.settings.auth.accessToken
  }

  /**
   * トークンの有効期限をチェック
   */
  isTokenExpired(): boolean {
    if (!this.settings.auth.expiresAt) return true
    // 期限の5分前から期限切れとみなす（余裕を持たせる）
    return Date.now() >= this.settings.auth.expiresAt - 5 * 60 * 1000
  }

  /**
   * トークンをリフレッシュ
   */
  async refreshToken(): Promise<boolean> {
    if (!this.settings.auth.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.settings.apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.settings.auth.refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('トークンのリフレッシュに失敗しました')
      }

      const data = await response.json()

      this.settings.auth.accessToken = data.data.access_token
      this.settings.auth.refreshToken = data.data.refresh_token
      this.settings.auth.expiresAt = Date.now() + data.data.expires_in * 1000

      await this.saveSettings()
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      // リフレッシュ失敗時はログアウト状態に
      await this.logout()
      new Notice('セッションの有効期限が切れました。再度ログインしてください。')
      return false
    }
  }

  /**
   * 有効なアクセストークンを取得（必要に応じてリフレッシュ）
   */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.isLoggedIn()) {
      return null
    }

    // トークンが期限切れの場合はリフレッシュ
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        return null
      }
    }

    return this.settings.auth.accessToken
  }

  /**
   * ユーザー情報を取得
   */
  getUserEmail(): string | null {
    return this.settings.auth.userEmail
  }
}
