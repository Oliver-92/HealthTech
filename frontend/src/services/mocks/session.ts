import { useAuthStore } from '@/store/authStore'
import { MOCK_CAREGIVERS } from './data'

/**
 * Resuelve el id de la entidad Caregiver del usuario logueado (modo mock),
 * para que los endpoints "míos" no queden hardcodeados a un cuidador fijo.
 */
export function currentCaregiverId(): number {
  const user = useAuthStore.getState().user
  const caregiver = MOCK_CAREGIVERS.find((c) => c.user.email === user?.email)
  return caregiver?.id ?? MOCK_CAREGIVERS[0].id
}
