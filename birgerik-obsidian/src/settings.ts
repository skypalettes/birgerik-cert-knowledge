import { App, PluginSettingTab, Setting } from 'obsidian'
import type BirgerikPlugin from './main'

/**
 * プラグイン設定
 */
export interface BirgerikSettings {
  apiUrl: string
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: BirgerikSettings = {
  apiUrl: 'https://birgerik.vercel.app',
}

/**
 * 設定タブ
 */
export class BirgerikSettingTab extends PluginSettingTab {
  plugin: BirgerikPlugin

  constructor(app: App, plugin: BirgerikPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    // ヘッダー
    containerEl.createEl('h2', { text: 'Birgerik Study 設定' })

    // API URL設定
    new Setting(containerEl)
      .setName('API URL')
      .setDesc(
        'Birgerik APIのベースURL。デフォルトは本番環境です。ローカル開発時のみ変更してください。'
      )
      .addText((text) =>
        text
          .setPlaceholder('https://birgerik.vercel.app')
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiUrl = value.trim() || DEFAULT_SETTINGS.apiUrl
            await this.plugin.saveSettings()

            // APIクライアントのURLを更新
            this.plugin.apiClient.setBaseUrl(this.plugin.settings.apiUrl)
          })
      )

    // 接続テストボタン
    new Setting(containerEl)
      .setName('API接続テスト')
      .setDesc('Birgerik APIに接続できるか確認します')
      .addButton((button) =>
        button
          .setButtonText('接続テスト')
          .setCta()
          .onClick(async () => {
            button.setButtonText('テスト中...')
            button.setDisabled(true)

            try {
              const isConnected = await this.plugin.apiClient.testConnection()

              if (isConnected) {
                button.setButtonText('✓ 接続成功')
                setTimeout(() => {
                  button.setButtonText('接続テスト')
                  button.setDisabled(false)
                }, 2000)
              } else {
                button.setButtonText('✗ 接続失敗')
                setTimeout(() => {
                  button.setButtonText('接続テスト')
                  button.setDisabled(false)
                }, 2000)
              }
            } catch (error) {
              console.error('Connection test error:', error)
              button.setButtonText('✗ エラー')
              setTimeout(() => {
                button.setButtonText('接続テスト')
                button.setDisabled(false)
              }, 2000)
            }
          })
      )

    // 使い方
    containerEl.createEl('h3', { text: '使い方' })
    containerEl.createEl('p', {
      text: 'コマンドパレットから「Birgerik: 学習を開始」を実行するか、リボンアイコンをクリックして学習を開始できます。',
    })

    // リンク
    containerEl.createEl('h3', { text: 'リンク' })
    const linkContainer = containerEl.createDiv()
    linkContainer.createEl('a', {
      text: '📚 Birgerik Web版',
      href: 'https://birgerik.vercel.app',
    })
    linkContainer.createEl('br')
    linkContainer.createEl('a', {
      text: '🐛 バグ報告・機能要望',
      href: 'https://github.com/irunadev/birgerik/issues',
    })
  }
}
