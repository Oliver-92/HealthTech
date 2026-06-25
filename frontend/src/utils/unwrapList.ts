import type { Paginated } from '@/types'

/**
 * Normaliza la respuesta de un listado: el backend devuelve T[] cuando no
 * se pasan page/pageSize, o Paginated<T> cuando sí. Siempre retorna { data, total }.
 */
export const unwrapList = <T>(
  res: T[] | Paginated<T>,
): { data: T[]; total: number } => {
  if (Array.isArray(res)) return { data: res, total: res.length }
  return { data: res.data, total: res.total }
}
