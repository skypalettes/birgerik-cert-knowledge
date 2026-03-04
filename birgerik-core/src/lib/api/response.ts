import { NextResponse } from 'next/server'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status, headers: JSON_HEADERS })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: JSON_HEADERS })
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    { error: '入力内容に誤りがあります', fieldErrors: errors },
    { status: 422, headers: JSON_HEADERS }
  )
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401, headers: JSON_HEADERS })
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403, headers: JSON_HEADERS })
}

export function notFoundResponse(message = 'Not Found') {
  return NextResponse.json({ error: message }, { status: 404, headers: JSON_HEADERS })
}

export function serverErrorResponse(message = 'Internal Server Error') {
  return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS })
}
