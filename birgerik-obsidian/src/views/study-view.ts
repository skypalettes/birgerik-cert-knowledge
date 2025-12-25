import { ItemView, WorkspaceLeaf } from 'obsidian'
import { render } from 'preact'
import { h } from 'preact'
import { StudyApp } from '@/components/study-app'
import type BirgerikPlugin from '../main'

export const VIEW_TYPE_BIRGERIK = 'birgerik-study-view'

/**
 * Birgerik 学習ビュー
 *
 * メインタブで表示される学習画面
 * Phase 2: Preactコンポーネントを使用
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

    // Phase 2: Preactコンポーネントをマウント
    render(h(StudyApp, { apiClient: this.plugin.apiClient }), container)
  }

  async onClose(): Promise<void> {
    // Preactコンポーネントをアンマウント
    const container = this.containerEl.children[1]
    render(null, container)
  }
}
