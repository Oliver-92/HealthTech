import { describe, it, expect } from 'vitest'
import { getPaginationArgs } from './pagination.js'

// Covers OPS-05 — opt-in pagination math
describe('getPaginationArgs', () => {
  it('returns null when no pagination is requested', () => {
    expect(getPaginationArgs({})).toBeNull()
  })

  it('defaults to page 1 / pageSize 20 when only one is given', () => {
    expect(getPaginationArgs({ page: 1 })).toEqual({ skip: 0, take: 20, page: 1, pageSize: 20 })
    expect(getPaginationArgs({ pageSize: 5 })).toEqual({ skip: 0, take: 5, page: 1, pageSize: 5 })
  })

  it('computes skip from page and pageSize', () => {
    expect(getPaginationArgs({ page: 3, pageSize: 10 })).toEqual({
      skip: 20,
      take: 10,
      page: 3,
      pageSize: 10,
    })
  })
})
