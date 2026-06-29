import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { setNavigate } from '@/utils/navigation'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardLayout } from '@/components/layout'
import { FullScreenLoader } from '@/components/common'
import { Link } from 'react-router-dom'

// Landing y Login se cargan eager: son la entrada del demo y evitan un flash de Suspense.
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'

// Páginas autenticadas: code-splitting por ruta/rol (named exports → default).
const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })))
const Caregivers        = lazy(() => import('@/pages/admin/Caregivers').then((m) => ({ default: m.Caregivers })))
const Patients          = lazy(() => import('@/pages/admin/Patients').then((m) => ({ default: m.Patients })))
const Shifts            = lazy(() => import('@/pages/admin/Shifts').then((m) => ({ default: m.Shifts })))
const Reports           = lazy(() => import('@/pages/admin/Reports').then((m) => ({ default: m.Reports })))
const Billing           = lazy(() => import('@/pages/admin/Billing').then((m) => ({ default: m.Billing })))
const CaregiverDashboard = lazy(() => import('@/pages/caregiver/Dashboard').then((m) => ({ default: m.CaregiverDashboard })))
const MyShifts          = lazy(() => import('@/pages/caregiver/MyShifts').then((m) => ({ default: m.MyShifts })))
const MyReports         = lazy(() => import('@/pages/caregiver/MyReports').then((m) => ({ default: m.MyReports })))
const UploadReport      = lazy(() => import('@/pages/caregiver/UploadReport').then((m) => ({ default: m.UploadReport })))
const PatientDashboard  = lazy(() => import('@/pages/patient/Dashboard').then((m) => ({ default: m.PatientDashboard })))
const PatientReports    = lazy(() => import('@/pages/patient/PatientReports').then((m) => ({ default: m.PatientReports })))

// Expone la función de navegación de React Router al interceptor de axios (401)
function NavigationBridge() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate((path) => navigate(path))
  }, [navigate])
  return null
}

// 404
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-3 text-center bg-background text-foreground">
      <p className="text-6xl font-bold text-muted">404</p>
      <p className="text-xl font-semibold">Página no encontrada</p>
      <Link to="/" className="text-sm text-primary underline underline-offset-4">
        Volver al inicio
      </Link>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter  basename={import.meta.env.BASE_URL}>
      <NavigationBridge />
      <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Público — la raíz del demo es la landing de presentación */}
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN — autenticado + layout */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard"  element={<AdminDashboard />} />
            <Route path="/admin/caregivers" element={<Caregivers />} />
            <Route path="/admin/patients"   element={<Patients />} />
            <Route path="/admin/shifts"     element={<Shifts />} />
            <Route path="/admin/reports"    element={<Reports />} />
            <Route path="/admin/billing"    element={<Billing />} />
          </Route>
        </Route>

        {/* CAREGIVER — autenticado + layout */}
        <Route element={<ProtectedRoute roles={['CAREGIVER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/caregiver/dashboard"        element={<CaregiverDashboard />} />
            <Route path="/caregiver/shifts"           element={<MyShifts />} />
            <Route path="/caregiver/reports"          element={<MyReports />} />
            <Route path="/caregiver/reports/:shiftId" element={<UploadReport />} />
          </Route>
        </Route>

        {/* PATIENT — autenticado + layout */}
        <Route element={<ProtectedRoute roles={['PATIENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/reports"   element={<PatientReports />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*"  element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
