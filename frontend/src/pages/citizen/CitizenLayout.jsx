import { Outlet } from 'react-router-dom'
import CitizenSidebar from '../../components/citizen/CitizenSidebar'
import NotificationBell from '../../components/shared/NotificationBell'

export default function CitizenLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <CitizenSidebar />
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