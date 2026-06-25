import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { MENU_ITEMS } from '@/constants/menu'
import { usePermissions } from '@/hooks/usePermissions'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

export function Sidebar() {
  const { hasRole } = usePermissions()
  const { sidebarOpen, setSidebar } = useUiStore()

  const visibleItems = MENU_ITEMS.filter((item) => hasRole(item.roles))

  return (
    <>
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebar(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-surface border-r border-border',
          'transition-transform duration-200',
          'md:static md:translate-x-0 md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <span className="text-base font-bold text-foreground tracking-tight">
            Health<span className="text-primary">Tech</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebar(false)}
            aria-label="Cerrar menú"
            className="md:hidden text-muted hover:text-foreground transition-colors p-1 rounded-(--radius)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-(--radius) px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
                )
              }
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
