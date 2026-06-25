import { USE_MOCKS } from './config'
import { reportServiceReal } from './impl/report.real'
import { reportServiceMock } from './impl/report.mock'

export const reportService = USE_MOCKS ? reportServiceMock : reportServiceReal
