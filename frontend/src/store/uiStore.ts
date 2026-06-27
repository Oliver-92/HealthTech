import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
  globalLoading: boolean
  setGlobalLoading: (v: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  // Cerrado por defecto: en mobile evita que el drawer tape el contenido al cargar;
  // en desktop el Sidebar se muestra siempre vía `md:static md:translate-x-0`.
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  globalLoading: false,
  setGlobalLoading: (v) => set({ globalLoading: v }),
}))
