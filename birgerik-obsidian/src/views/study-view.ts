import { ItemView, WorkspaceLeaf } from 'obsidian'
import type BirgerikPlugin from '../main'

export const VIEW_TYPE_BIRGERIK = 'birgerik-study-view'

/**
 * Birgerik 学習ビュー
 *
 * メインタブで表示される学習画面
 */
export class BirgerikStudyView extends ItemView {
  plugin: BirgerikPlugin

  constructor(leaf: WorkspaceLeaf, plugin: BirgerikPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType(): string {
    return VIEW_TYPE_BIRGERIK
  }

  getDisplayText(): string {
    return 'Birgerik Study'
  }

  getIcon(): string {
    return 'graduation-cap'
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1]
    container.empty()
    container.addClass('birgerik-study-view')

    // Phase 1: 基本的なUI（Phase 2でPreactコンポーネントに置き換え）
    await this.renderBasicUI(container)
  }

  /**
   * 基本的なUIを描画（Phase 1）
   */
  private async renderBasicUI(container: Element): void {
    // ヘッダー
    const header = container.createDiv({ cls: 'birgerik-header' })
    header.createEl('h1', { text: '📚 Birgerik Study', cls: 'birgerik-title' })
    header.createEl('p', {
      text: '資格試験の問題演習をObsidian内で行えます',
      cls: 'birgerik-subtitle',
    })

    // ステータス
    const statusContainer = container.createDiv({ cls: 'birgerik-status' })
    const statusText = statusContainer.createEl('p', {
      text: 'API接続を確認中...',
      cls: 'birgerik-status-text',
    })

    // API接続テスト
    try {
      const isConnected = await this.plugin.apiClient.testConnection()

      if (isConnected) {
        statusText.setText('✓ APIに接続されました')
        statusText.addClass('birgerik-status-success')

        // 資格一覧を取得
        await this.renderCertifications(container)
      } else {
        statusText.setText('✗ APIに接続できませんでした')
        statusText.addClass('birgerik-status-error')
        this.renderErrorMessage(
          container,
          'APIに接続できません。設定を確認してください。'
        )
      }
    } catch (error) {
      console.error('API connection error:', error)
      statusText.setText('✗ エラーが発生しました')
      statusText.addClass('birgerik-status-error')
      this.renderErrorMessage(
        container,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * 資格一覧を表示
   */
  private async renderCertifications(container: Element): Promise<void> {
    try {
      const response = await this.plugin.apiClient.getCertifications()
      const certifications = response.certifications

      // セクション
      const section = container.createDiv({ cls: 'birgerik-section' })
      section.createEl('h2', { text: '資格一覧' })

      if (certifications.length === 0) {
        section.createEl('p', { text: '資格が登録されていません' })
        return
      }

      // 資格リスト
      const list = section.createDiv({ cls: 'birgerik-cert-list' })

      for (const cert of certifications) {
        const certCard = list.createDiv({ cls: 'birgerik-cert-card' })
        certCard.createEl('h3', { text: cert.name })

        if (cert.description) {
          certCard.createEl('p', { text: cert.description, cls: 'birgerik-cert-desc' })
        }

        // 問題セット数
        const meta = certCard.createDiv({ cls: 'birgerik-cert-meta' })
        meta.createEl('span', {
          text: `${cert.question_sets.length}個の問題セット`,
        })

        // 問題セットリスト
        if (cert.question_sets.length > 0) {
          const setList = certCard.createDiv({ cls: 'birgerik-set-list' })

          for (const set of cert.question_sets) {
            const setItem = setList.createDiv({ cls: 'birgerik-set-item' })
            setItem.createEl('span', { text: `📝 ${set.name}` })
            setItem.createEl('span', {
              text: `(${set.question_count}問)`,
              cls: 'birgerik-set-count',
            })

            // Phase 2で実装: クリックで学習開始
            setItem.addClass('birgerik-clickable')
            setItem.addEventListener('click', () => {
              console.log('Start study:', set.id)
              // TODO: Phase 2で学習画面に遷移
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error)
      this.renderErrorMessage(
        container,
        '資格一覧の取得に失敗しました: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

  /**
   * エラーメッセージを表示
   */
  private renderErrorMessage(container: Element, message: string): void {
    const errorDiv = container.createDiv({ cls: 'birgerik-error' })
    errorDiv.createEl('p', { text: '⚠️ ' + message })

    const suggestion = errorDiv.createDiv({ cls: 'birgerik-error-suggestion' })
    suggestion.createEl('p', { text: '以下を確認してください:' })
    const ul = suggestion.createEl('ul')
    ul.createEl('li', { text: 'インターネット接続' })
    ul.createEl('li', { text: 'API URLが正しいか（設定タブで確認）' })
    ul.createEl('li', { text: 'Birgerik APIサーバーが稼働しているか' })
  }

  async onClose(): Promise<void> {
    // クリーンアップ
    const container = this.containerEl.children[1]
    container.empty()
  }
}
