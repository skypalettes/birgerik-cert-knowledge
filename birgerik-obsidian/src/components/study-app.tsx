import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { useStudyStore, studyStore } from '@/store/study-store'
import { StudyScreen } from './study-screen'
import { ResultScreen } from './result-screen'
import type { BirgerikApiClient } from '@/api/client'
import type { CertificationWithQuestionSets } from '@/types/api'

interface StudyAppProps {
  apiClient: BirgerikApiClient
}

/**
 * Birgerik Study メインアプリコンポーネント
 *
 * 画面遷移を管理
 */
export function StudyApp({ apiClient }: StudyAppProps) {
  const currentScreen = useStudyStore((state) => state.currentScreen)

  return (
    <div className="birgerik-app">
      {currentScreen === 'certifications' && (
        <CertificationListScreen apiClient={apiClient} />
      )}
      {currentScreen === 'question-sets' && (
        <QuestionSetListScreen apiClient={apiClient} />
      )}
      {currentScreen === 'study' && <StudyScreen />}
      {currentScreen === 'result' && <ResultScreen />}
    </div>
  )
}

/**
 * 資格一覧画面
 */
function CertificationListScreen({ apiClient }: { apiClient: BirgerikApiClient }) {
  const [certifications, setCertifications] = useState<
    CertificationWithQuestionSets[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setSelectedCertification = useStudyStore((state) => state.setSelectedCertification)

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getCertifications()
      setCertifications(response.certifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="birgerik-loading">
        <div className="loading-spinner"></div>
        <p>資格一覧を読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="birgerik-error">
        <p>⚠️ {error}</p>
        <button className="study-btn study-btn-primary" onClick={loadCertifications}>
          再読み込み
        </button>
      </div>
    )
  }

  if (certifications.length === 0) {
    return (
      <div className="birgerik-empty">
        <p>資格が登録されていません</p>
      </div>
    )
  }

  return (
    <div className="birgerik-cert-screen">
      <div className="cert-header">
        <h2>資格一覧</h2>
        <p>学習したい資格を選択してください</p>
      </div>

      <div className="cert-list">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="cert-card"
            onClick={() => setSelectedCertification(cert.id)}
          >
            <h3>{cert.name}</h3>
            {cert.description && <p className="cert-desc">{cert.description}</p>}
            <div className="cert-meta">
              <span>{cert.question_sets.length}個の問題セット</span>
              <span className="cert-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 問題セット一覧画面
 */
function QuestionSetListScreen({ apiClient }: { apiClient: BirgerikApiClient }) {
  const [certifications, setCertifications] = useState<
    CertificationWithQuestionSets[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedCertificationId = useStudyStore((state) => state.selectedCertificationId)
  const setCurrentScreen = useStudyStore((state) => state.setCurrentScreen)
  const startSession = useStudyStore((state) => state.startSession)
  const setSelectedQuestionSet = useStudyStore((state) => state.setSelectedQuestionSet)

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getCertifications()
      setCertifications(response.certifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const selectedCert = certifications.find((c) => c.id === selectedCertificationId)

  const handleStartStudy = async (questionSetId: string) => {
    try {
      setSelectedQuestionSet(questionSetId)

      // 問題を取得
      const response = await apiClient.getQuestions(questionSetId)

      if (response.questions.length === 0) {
        setError('この問題セットには問題がありません')
        return
      }

      // 問題セット情報を取得
      const questionSet = selectedCert?.question_sets.find(
        (qs) => qs.id === questionSetId
      )

      if (!questionSet) {
        setError('問題セットが見つかりません')
        return
      }

      // セッション開始
      startSession(
        questionSetId,
        questionSet.name,
        selectedCert?.name || '',
        response.questions
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '問題の取得に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="birgerik-loading">
        <div className="loading-spinner"></div>
        <p>問題セットを読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="birgerik-error">
        <p>⚠️ {error}</p>
        <button className="study-btn study-btn-primary" onClick={loadCertifications}>
          再読み込み
        </button>
      </div>
    )
  }

  if (!selectedCert) {
    return (
      <div className="birgerik-error">
        <p>資格が見つかりません</p>
        <button
          className="study-btn study-btn-primary"
          onClick={() => setCurrentScreen('certifications')}
        >
          ← 資格一覧に戻る
        </button>
      </div>
    )
  }

  return (
    <div className="birgerik-set-screen">
      <div className="set-header">
        <button
          className="set-back-btn"
          onClick={() => setCurrentScreen('certifications')}
        >
          ← 戻る
        </button>
        <h2>{selectedCert.name}</h2>
        <p>問題セットを選択してください</p>
      </div>

      <div className="set-list">
        {selectedCert.question_sets.map((set) => (
          <div
            key={set.id}
            className="set-card"
            onClick={() => handleStartStudy(set.id)}
          >
            <div className="set-icon">📝</div>
            <div className="set-content">
              <h3>{set.name}</h3>
              {set.description && <p className="set-desc">{set.description}</p>}
              <div className="set-meta">
                <span>{set.question_count}問</span>
                <span className="set-arrow">学習開始 →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
