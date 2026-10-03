import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import NotificationBell from '../../components/shared/NotificationBell'


export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <AdminSidebar />
      <div className="ml-56 flex flex-col min-h-screen w-[calc(100%-14rem)]">

        {/* Top bar */}
        <div className="flex justify-end items-center px-8 py-4">
          <NotificationBell />
        </div>

        {/* Page content */}
        <main className="flex-1 px-8 pb-8">
          <Outlet />
        </main>

      </div>
    </div>
  )
}