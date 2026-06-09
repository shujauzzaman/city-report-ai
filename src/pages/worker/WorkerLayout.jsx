import { Outlet } from 'react-router-dom'
import WorkerSidebar from '../../components/worker/WorkerSidebar'

export default function WorkerLayout() {
  return (
    <div className="flex min-h-screen bg-brand-surface">
      <WorkerSidebar />
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}