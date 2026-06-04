import { Outlet } from 'react-router-dom'
import CitizenSidebar from '../../components/citizen/CitizenSidebar'

export default function CitizenLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <CitizenSidebar />
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}