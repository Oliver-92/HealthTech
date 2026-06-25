const LOCALE = 'es-AR'

/** ISO string → "dd/mm/aaaa" */
export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** ISO string → "YYYY-MM-DD" para inputs type="date" */
export const dateInput = (iso: string | null | undefined): string => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

/** "HH:MM" → "HH:MM hs" */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '—'
  return `${time} hs`
}
