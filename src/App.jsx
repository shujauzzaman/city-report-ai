import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Authentication from './pages/auth/Authentication'
import OTPVerification from './pages/auth/OTPVerification'
import ProtectedRoute from './components/shared/ProtectedRoute'
import ProfilePage from './pages/shared/ProfilePage'

// Admin routes
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import DepartmentDetail from './pages/admin/DepartmentDetail'
import AdminUsersList from './pages/admin/AdminUsersList'
// citizen routes
import CitizenLayout from './pages/citizen/CitizenLayout'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import SubmitComplaint from './pages/citizen/SubmitComplaint'
import MyComplaints from './pages/citizen/MyComplaints'
// officer routes
import OfficerDashboard from './pages/officer/OfficerDashboard'
import OfficerLayout from './pages/officer/OfficerLayout'
import OfficerComplaints from './pages/officer/OfficerComplaints'
// worker routes
import WorkerLayout from './pages/worker/WorkerLayout'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerTasks from './pages/worker/WorkerTasks'

function App () {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/authenticate' element={<Authentication />} />
      <Route path="/verify-otp" element={<OTPVerification />} />

      {/* admin */}
      <Route path="/a" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="department/:name" element={<DepartmentDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="/a/users/:role" element={<AdminUsersList />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* citizen */}
      <Route path="/c" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* officer */}
      <Route path="/o" element={
        <ProtectedRoute allowedRoles={['officer']}>
          <OfficerLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<OfficerComplaints />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* worker */}
      <Route path="/w" element={
        <ProtectedRoute allowedRoles={['worker']}>
          <WorkerLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="tasks" element={<WorkerTasks />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App 