import type { ShiftStatus, ReportStatus, PaymentReportStatus } from '@/types'
import type { BadgeVariant } from './badgeVariants'

interface StatusConfig {
  label: string
  variant: BadgeVariant
}

export const SHIFT_STATUS: Record<ShiftStatus, StatusConfig> = {
  SCHEDULED:   { label: 'Programada',  variant: 'default'  },
  IN_PROGRESS: { label: 'En curso',    variant: 'info'     },
  COMPLETED:   { label: 'Completada',  variant: 'success'  },
  CANCELLED:   { label: 'Cancelada',   variant: 'danger'   },
  NO_SHOW:     { label: 'Ausente',     variant: 'warning'  },
}

export const REPORT_STATUS: Record<ReportStatus, StatusConfig> = {
  DRAFT:     { label: 'Borrador',    variant: 'default' },
  SUBMITTED: { label: 'Enviado',     variant: 'info'    },
  APPROVED:  { label: 'Aprobado',    variant: 'success' },
  REJECTED:  { label: 'Rechazado',   variant: 'danger'  },
}

export const PAYMENT_REPORT_STATUS: Record<PaymentReportStatus, StatusConfig> = {
  GENERATED:            { label: 'Generado',       variant: 'default' },
  PAYMENT_IN_PROGRESS:  { label: 'En proceso',     variant: 'info'    },
  PAID:                 { label: 'Pagado',          variant: 'success' },
  PAYMENT_FAILED:       { label: 'Fallo de pago',  variant: 'danger'  },
  CANCELLED:            { label: 'Cancelado',       variant: 'danger'  },
}
