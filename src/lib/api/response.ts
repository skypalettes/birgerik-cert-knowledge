import { NextResponse } from 'next/server'

/**
 * 成功レスポンス
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

/**
 * エラーレスポンス
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

/**
 * バリデーションエラーレスポンス
 */
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    { error: 'Validation failed', fieldErrors: errors },
    {
      status: 422,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

/**
 * 認証エラーレスポンス
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

/**
 * 権限エラーレスポンス
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

/**
 * Not Foundレスポンス
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}

/**
 * サーバーエラーレスポンス
 */
export function serverErrorResponse(message: string = 'Internal server error'): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}
