import { USE_MOCKS } from './config'
import { metricsServiceReal } from './impl/metrics.real'
import { metricsServiceMock } from './impl/metrics.mock'

export const metricsService = USE_MOCKS ? metricsServiceMock : metricsServiceReal
