import { describe, it, expect } from 'vitest'
import { dateString } from './schemas.js'

// Covers BUG-03 — strict calendar date validation
describe('dateString', () => {
  it.each(['2024-03-01', '1945-08-22', '2024-02-29'])('accepts valid date %s', (s) => {
    expect(dateString.safeParse(s).success).toBe(true)
  })

  it.each(['2024-02-31', '2024-13-01', '2023-02-29', 'ayer', '2024-3-1', '', '2024/03/01'])(
    'rejects invalid date %s',
    (s) => {
      expect(dateString.safeParse(s).success).toBe(false)
    },
  )
})
