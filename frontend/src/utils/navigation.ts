/**
 * Referencia de navegación seteada en el root (dentro del Router). Permite navegar
 * desde fuera de React — por ejemplo, desde el interceptor de axios al recibir un 401.
 * Evita usar `window.location` (que fuerza un reload y pierde el estado del store).
 */
let navigateRef: ((path: string) => void) | null = null

export const setNavigate = (fn: (path: string) => void) => {
  navigateRef = fn
}

export const redirectToLogin = () => {
  navigateRef?.('/login')
}
