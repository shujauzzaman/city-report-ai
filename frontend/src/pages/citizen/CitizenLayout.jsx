import AppShell from '../../components/shared/AppShell'
import CitizenSidebar from '../../components/citizen/CitizenSidebar'

export default function CitizenLayout() {
  return <AppShell Sidebar={CitizenSidebar} />
}