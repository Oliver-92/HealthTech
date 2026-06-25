import { USE_MOCKS } from './config'
import { shiftServiceReal } from './impl/shift.real'
import { shiftServiceMock } from './impl/shift.mock'

export const shiftService = USE_MOCKS ? shiftServiceMock : shiftServiceReal
