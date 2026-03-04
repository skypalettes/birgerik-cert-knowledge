export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}が見つかりません`, 'NOT_FOUND', 404)
  }
}

export function handleSupabaseError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const e = error as { code: string; message?: string }
    switch (e.code) {
      case '23505': return new AppError('このデータは既に登録されています', 'UNIQUE_VIOLATION', 409)
      case '23503': return new AppError('関連するデータが見つかりません', 'FK_VIOLATION', 400)
      case 'PGRST116': return new NotFoundError('データ')
    }
  }
  return new DatabaseError('データベースエラーが発生しました')
}
