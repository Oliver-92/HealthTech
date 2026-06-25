import { USE_MOCKS } from './config'
import { patientServiceReal } from './impl/patient.real'
import { patientServiceMock } from './impl/patient.mock'

export const patientService = USE_MOCKS ? patientServiceMock : patientServiceReal
