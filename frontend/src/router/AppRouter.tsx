import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { roleHome } from '@/constants/roles'
import { ProtectedRoute } from './ProtectedRoute'

import { Login } from '@/pages/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { Caregivers } from '@/pages/admin/Caregivers'
import { Patients } from '@/pages/admin/Patients'
import { Shifts } from '@/pages/admin/Shifts'
import { Reports } from '@/pages/admin/Reports'
import { Billing } from '@/pages/admin/Billing'
import { CaregiverDashboard } from '@/pages/caregiver/Dashboard'
import { MyShifts } from '@/pages/caregiver/MyShifts'
import { MyReports } from '@/pages/caregiver/MyReports'
import { UploadReport } from '@/pages/caregiver/UploadReport'
import { PatientDashboard } from '@/pages/patient/Dashboard'
import { PatientReports } from '@/pages/patient/PatientReports'

// Redirige la raíz al home del rol o a /login
function RootRedirect() {
  const { isAuthenticated, role } = useAuthStore()
  if (isAuthenticated && role) return <Navigate to={roleHome(role)} replace />
  return <Navigate to="/login" replace />
}

// 404
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-3 text-center bg-background text-foreground">
      <p className="text-6xl font-bold text-muted">404</p>
      <p className="text-xl font-semibold">Página no encontrada</p>
      <a href="/" className="text-sm text-primary underline underline-offset-4">
        Volver al inicio
      </a>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin/dashboard"  element={<AdminDashboard />} />
          <Route path="/admin/caregivers" element={<Caregivers />} />
          <Route path="/admin/patients"   element={<Patients />} />
          <Route path="/admin/shifts"     element={<Shifts />} />
          <Route path="/admin/reports"    element={<Reports />} />
          <Route path="/admin/billing"    element={<Billing />} />
        </Route>

        {/* CAREGIVER */}
        <Route element={<ProtectedRoute roles={['CAREGIVER']} />}>
          <Route path="/caregiver/dashboard"          element={<CaregiverDashboard />} />
          <Route path="/caregiver/shifts"             element={<MyShifts />} />
          <Route path="/caregiver/reports"            element={<MyReports />} />
          <Route path="/caregiver/reports/:shiftId"   element={<UploadReport />} />
        </Route>

        {/* PATIENT */}
        <Route element={<ProtectedRoute roles={['PATIENT']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/reports"   element={<PatientReports />} />
        </Route>

        {/* Raíz y 404 */}
        <Route path="/"  element={<RootRedirect />} />
        <Route path="*"  element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
