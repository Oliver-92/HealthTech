import { Construction } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Construction size={40} className="text-muted" />
      <p className="text-xl font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted">Esta sección se implementa en las próximas etapas.</p>
    </div>
  )
}
