export type DatabaseResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}
