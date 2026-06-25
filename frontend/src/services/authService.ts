import { USE_MOCKS } from './config'
import { authServiceReal } from './impl/auth.real'
import { authServiceMock } from './impl/auth.mock'

export const authService = USE_MOCKS ? authServiceMock : authServiceReal
