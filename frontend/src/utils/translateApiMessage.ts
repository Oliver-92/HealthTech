// Traduce al español los mensajes de error que devuelve el backend (en inglés),
// de forma centralizada, para que los toasts y errores se muestren en el idioma
// de la app. Los desconocidos se dejan tal cual (no se oculta información).

const STATUS_ES: Record<string, string> = {
  // ShiftStatus
  SCHEDULED: 'programada', IN_PROGRESS: 'en curso', COMPLETED: 'completada',
  CANCELLED: 'cancelada', NO_SHOW: 'ausente',
  // ReportStatus
  DRAFT: 'borrador', SUBMITTED: 'enviado', APPROVED: 'aprobado', REJECTED: 'rechazado',
  // PaymentReportStatus
  GENERATED: 'generada', PAYMENT_IN_PROGRESS: 'en proceso', PAID: 'pagada', PAYMENT_FAILED: 'fallida',
}
const st = (s: string) => STATUS_ES[s] ?? s

const NOT_FOUND_ES: Record<string, string> = {
  Caregiver: 'Cuidador no encontrado',
  Patient: 'Paciente no encontrado',
  Shift: 'Guardia no encontrada',
  Report: 'Informe no encontrado',
  'Payment report': 'Liquidación no encontrada',
  Payment: 'Pago no encontrado',
  'Payroll period': 'Período no encontrado',
}

const STATIC: Record<string, string> = {
  'Invalid credentials': 'Credenciales inválidas',
  'Validation error': 'Error de validación',
  'Route not found': 'Recurso no encontrado',
  'Internal server error': 'Error interno del servidor',
  'Cannot delete a shift that already has a report': 'No se puede eliminar una guardia que ya tiene un informe',
  'Cannot generate reports for a closed period': 'No se pueden generar liquidaciones de un período cerrado',
  'Caregiver is inactive': 'El cuidador está inactivo',
  'Patient is inactive': 'El paciente está inactivo',
  'Payroll period is already closed': 'El período de liquidación ya está cerrado',
  'startTime and endTime must differ': 'La hora de inicio y la de fin deben ser distintas',
  'Caregiver profile not found for this user': 'No se encontró el perfil de cuidador para este usuario',
  'Patient profile not found for this user': 'No se encontró el perfil de paciente para este usuario',
  'This report does not belong to you': 'Este informe no te pertenece',
  'This shift already has an approved report': 'Esta guardia ya tiene un informe aprobado',
  'This shift is not assigned to you': 'Esta guardia no está asignada a vos',
  'User not found or inactive': 'Usuario no encontrado o inactivo',
  'Missing or malformed Authorization header': 'Falta el encabezado de autorización o es inválido',
  'Invalid or expired token': 'Token inválido o expirado',
  'Invalid or expired refresh token': 'Sesión inválida o expirada',
  'Missing refresh token': 'Falta el token de sesión',
}

const PATTERNS: { re: RegExp; es: (m: RegExpMatchArray) => string }[] = [
  { re: /^A caregiver with this email already exists$/,        es: () => 'Ya existe un cuidador con este email' },
  { re: /^A caregiver with this document ID already exists$/,  es: () => 'Ya existe un cuidador con este documento' },
  { re: /^A user with this email already exists$/,             es: () => 'Ya existe un usuario con este email' },
  { re: /^A patient with this document ID already exists$/,    es: () => 'Ya existe un paciente con este documento' },
  {
    re: /^Caregiver already has a shift overlapping this time \((.+)\)$/,
    es: (m) => `El cuidador ya tiene una guardia que se solapa con este horario (${m[1]})`,
  },
  { re: /^Cannot edit a report with status (\w+)$/,  es: (m) => `No se puede editar un informe en estado ${st(m[1])}` },
  { re: /^Cannot edit a shift with status (\w+)$/,   es: (m) => `No se puede editar una guardia en estado ${st(m[1])}` },
  { re: /^Cannot pay a report in status (\w+)$/,     es: (m) => `No se puede pagar una liquidación en estado ${st(m[1])}` },
  { re: /^Cannot report on a (\w+) shift$/,          es: (m) => `No se puede cargar un informe en una guardia ${st(m[1])}` },
  { re: /^Cannot approve a report for a (\w+) shift$/, es: (m) => `No se puede aprobar un informe de una guardia ${st(m[1])}` },
  { re: /^Only DRAFT reports can be submitted \(current: (\w+)\)$/,    es: (m) => `Solo se pueden enviar informes en borrador (actual: ${st(m[1])})` },
  { re: /^Only SUBMITTED reports can be approved \(current: (\w+)\)$/, es: (m) => `Solo se pueden aprobar informes enviados (actual: ${st(m[1])})` },
  { re: /^Only SUBMITTED reports can be rejected \(current: (\w+)\)$/, es: (m) => `Solo se pueden rechazar informes enviados (actual: ${st(m[1])})` },
  { re: /^Only SCHEDULED shifts can be deleted \(current: (\w+)\)$/,   es: (m) => `Solo se pueden eliminar guardias programadas (actual: ${st(m[1])})` },
  { re: /^Access restricted to: .+$/, es: () => 'No tenés permiso para realizar esta acción' },
  {
    re: /^(Caregiver|Patient|Shift|Report|Payment report|Payment|Payroll period) #\d+ not found$/,
    es: (m) => NOT_FOUND_ES[m[1]] ?? 'Recurso no encontrado',
  },
]

export function translateApiMessage(message: string | undefined): string | undefined {
  if (!message) return message
  if (STATIC[message]) return STATIC[message]
  for (const { re, es } of PATTERNS) {
    const match = message.match(re)
    if (match) return es(match)
  }
  return message
}
