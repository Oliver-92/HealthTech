import { api } from '../api'
import type { AdminMetrics } from '@/types'

export const metricsServiceReal = {
  getAdminMetrics: () =>
    api.get<AdminMetrics>('/admin/metrics').then((r) => r.data),
}
