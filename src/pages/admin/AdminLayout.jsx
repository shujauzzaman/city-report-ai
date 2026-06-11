import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}