import { Plugin, WorkspaceLeaf } from 'obsidian'
import { BirgerikApiClient } from './api/client'
import { BirgerikSettingTab, DEFAULT_SETTINGS, type BirgerikSettings } from './settings'
import { BirgerikStudyView, VIEW_TYPE_BIRGERIK } from './views/study-view'
import { AuthService } from './services/auth-service'

/**
 * Birgerik Study プラグイン
 *
 * Obsidian内で資格試験の問題演習を行うプラグイン
 */
export default class BirgerikPlugin extends Plugin {
  settings!: BirgerikSettings
  authService!: AuthService
  apiClient!: BirgerikApiClient

  async onload() {
    // 設定を読み込み
    await this.loadSettings()

    // 認証サービスを初期化
    this.authService = new AuthService(
      this.settings,
      this.saveSettings.bind(this)
    )

    // APIクライアントを初期化
    this.apiClient = new BirgerikApiClient(this.settings.apiUrl, this.authService)

    // ビューを登録
    this.registerView(VIEW_TYPE_BIRGERIK, (leaf) => new BirgerikStudyView(leaf, this))

    // リボンアイコンを追加
    this.addRibbonIcon('graduation-cap', 'Birgerik Study', () => {
      this.activateView()
    })

    // コマンドを追加
    this.addCommand({
      id: 'open-birgerik-study',
      name: '学習を開始',
      callback: () => {
        this.activateView()
      },
    })

    // 設定タブを追加
    this.addSettingTab(new BirgerikSettingTab(this.app, this))

    console.log('Birgerik Study プラグインを読み込みました')
  }

  onunload() {
    // ビューをすべて閉じる
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_BIRGERIK)
    console.log('Birgerik Study プラグインをアンロードしました')
  }

  /**
   * 学習ビューをアクティブ化
   */
  async activateView() {
    const { workspace } = this.app

    // 既存のビューを探す
    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_BIRGERIK)

    if (leaves.length > 0) {
      // 既存のビューがあればそれをアクティブ化
      leaf = leaves[0]
    } else {
      // 新しいビューを作成（メインタブで開く）
      leaf = workspace.getLeaf('tab')
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_BIRGERIK,
          active: true,
        })
      }
    }

    // ビューを表示
    if (leaf) {
      workspace.revealLeaf(leaf)
    }
  }

  /**
   * 設定を読み込み
   */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  /**
   * 設定を保存
   */
  async saveSettings() {
    await this.saveData(this.settings)
  }
}
