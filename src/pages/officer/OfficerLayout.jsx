import { Outlet } from 'react-router-dom'
import OfficerSidebar from '../officer/OfficerSidebar'

export default function OfficerLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <OfficerSidebar />
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}