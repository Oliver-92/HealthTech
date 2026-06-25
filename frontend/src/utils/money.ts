const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
})

/** number → "$1.500,00" (ARS locale) */
export const formatMoney = (amount: number): string => formatter.format(amount)

/** minutos → "Xh Ym" (ej. 90 → "1h 30m") */
export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
