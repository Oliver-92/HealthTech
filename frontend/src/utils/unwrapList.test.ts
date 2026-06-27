import { describe, it, expect } from 'vitest'
import { unwrapList } from './unwrapList'

describe('unwrapList', () => {
  it('normaliza un array plano a { data, total }', () => {
    const res = unwrapList([1, 2, 3])
    expect(res).toEqual({ data: [1, 2, 3], total: 3 })
  })

  it('pasa a través una respuesta paginada', () => {
    const res = unwrapList({ data: [{ id: 1 }], total: 42, page: 1, pageSize: 10 })
    expect(res).toEqual({ data: [{ id: 1 }], total: 42 })
  })

  it('array vacío → total 0', () => {
    expect(unwrapList([])).toEqual({ data: [], total: 0 })
  })
})
