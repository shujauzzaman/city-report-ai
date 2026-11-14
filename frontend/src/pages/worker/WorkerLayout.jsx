import AppShell from '../../components/shared/AppShell'
import WorkerSidebar from '../../components/worker/WorkerSidebar'

export default function WorkerLayout() {
  return <AppShell Sidebar={WorkerSidebar} />
}