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
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500)
    if (originalError) {
      console.error('Original error:', originalError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}が見つかりませんでした`, 'NOT_FOUND', 404)
  }
}

// Supabaseエラーを処理
export function handleSupabaseError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string }
    
    switch (supabaseError.code) {
      case '23505': // Unique violation
        return new DatabaseError('このデータは既に登録されています')
      case '23503': // Foreign key violation
        return new DatabaseError('関連するデータが存在しないため、操作できません')
      case 'PGRST116': // No rows returned
        return new NotFoundError('データ')
      default:
        return new DatabaseError(supabaseError.message || 'データベースエラーが発生しました')
    }
  }
  
  return new DatabaseError('予期しないエラーが発生しました', error)
}