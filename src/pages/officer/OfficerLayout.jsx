import { Outlet } from 'react-router-dom'
import OfficerSidebar from '../../components/officer/OfficerSidebar'
import NotificationBell from '../../components/shared/NotificationBell'
  

export default function OfficerLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <OfficerSidebar />
      <div className="ml-56 flex-1 flex flex-col">

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