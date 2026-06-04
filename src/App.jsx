import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Authentication from './pages/auth/Authentication'
import OTPVerification from './pages/auth/OTPVerification'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import OfficerDashboard from './pages/officer/OfficerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/shared/ProtectedRoute'

function App () {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/authenticate' element={<Authentication />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/c/dashboard" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/w/dashboard" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/o/dashboard" element={
        <ProtectedRoute allowedRoles={['officer']}>
          <OfficerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/a/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

    </Routes>
  )
}

export default App 