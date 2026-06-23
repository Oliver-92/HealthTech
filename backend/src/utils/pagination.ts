import { z } from 'zod'

// Reusable query fields for opt-in pagination. Spread into a list schema.
export const paginationFields = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Returns skip/take/page/pageSize when pagination is requested; null means the
// caller should return a plain array (backward-compatible default).
export function getPaginationArgs(p: { page?: number; pageSize?: number }) {
  if (p.page === undefined && p.pageSize === undefined) return null
  const page = p.page ?? 1
  const pageSize = p.pageSize ?? 20
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize }
}
