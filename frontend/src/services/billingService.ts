import { USE_MOCKS } from './config'
import { billingServiceReal } from './impl/billing.real'
import { billingServiceMock } from './impl/billing.mock'

export const billingService = USE_MOCKS ? billingServiceMock : billingServiceReal
