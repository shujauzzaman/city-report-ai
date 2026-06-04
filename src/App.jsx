import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Authentication from './pages/auth/Authentication'
import OTPVerification from './pages/auth/OTPVerification'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import OfficerDashboard from './pages/officer/OfficerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/shared/ProtectedRoute'
// citizen routes
import CitizenLayout from './pages/citizen/CitizenLayout'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import SubmitComplaint from './pages/citizen/SubmitComplaint'
import MyComplaints from './pages/citizen/MyComplaints'


function App () {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/authenticate' element={<Authentication />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
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
      <Route path="/c" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
      </Route>

    </Routes>
  )
}

export default App 