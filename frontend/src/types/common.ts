export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  message: string
  errors: string[]
}

export interface ListParams {
  q?: string
  isActive?: 'true' | 'false'
  page?: number
  pageSize?: number
}
