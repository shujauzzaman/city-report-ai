import AppShell from '../../components/shared/AppShell'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout() {
  return <AppShell Sidebar={AdminSidebar} />
}