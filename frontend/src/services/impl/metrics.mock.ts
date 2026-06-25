import { delay } from '../config'
import { MOCK_METRICS } from '../mocks/data'

export const metricsServiceMock = {
  getAdminMetrics: async () => {
    await delay()
    return MOCK_METRICS
  },
}
