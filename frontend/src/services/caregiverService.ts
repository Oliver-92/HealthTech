import { USE_MOCKS } from './config'
import { caregiverServiceReal } from './impl/caregiver.real'
import { caregiverServiceMock } from './impl/caregiver.mock'

export const caregiverService = USE_MOCKS ? caregiverServiceMock : caregiverServiceReal
