import type {
  GetCertificationsResponse,
  GetQuestionSetResponse,
  GetQuestionsResponse,
  GetExamConfigResponse,
} from '@birgerik/types'

async function apiFetch<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL が未設定です。birgerik-web/.env.local に設定してください。\n' +
      '例: NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1'
    )
  }
  const res = await fetch(`${baseUrl}${path}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getCertifications(): Promise<GetCertificationsResponse> {
  return apiFetch('/study/certifications')
}

export async function getQuestionSetDetail(id: string): Promise<GetQuestionSetResponse> {
  return apiFetch(`/study/question-sets/${id}`)
}

export async function getQuestions(questionSetId: string): Promise<GetQuestionsResponse> {
  return apiFetch(`/study/questions/${questionSetId}`)
}

export async function getExamConfig(questionSetId: string): Promise<GetExamConfigResponse> {
  return apiFetch(`/study/exams/${questionSetId}`)
}
