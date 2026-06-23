import { describe, it, expect } from 'vitest'
import { createReportSchema } from './reports.schema.js'

// Covers BIZ-02 — create defaults to draft; submit can be requested explicitly
describe('createReportSchema', () => {
  it('defaults submit to false (saves as draft)', () => {
    const r = createReportSchema.safeParse({ workedMinutes: 60 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.submit).toBe(false)
  })

  it('accepts submit: true', () => {
    const r = createReportSchema.safeParse({ workedMinutes: 60, submit: true })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.submit).toBe(true)
  })

  it('rejects non-positive workedMinutes', () => {
    expect(createReportSchema.safeParse({ workedMinutes: 0 }).success).toBe(false)
  })
})
