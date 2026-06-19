import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users } from 'lucide-react'
import SidebarUserMenu from '../shared/SidebarUserMenu'

const navItems = [
  { label: 'Dashboard', path: '/a/dashboard', icon: LayoutDashboard },
  { label: 'User Management', path: '/a/users', icon: Users },
]

export default function AdminSidebar() {

  return (
    <aside className="w-56 bg-brand-dark flex flex-col fixed h-full">

      <div className="px-5 py-5 border-b border-[#185FA5]">
        <p className="text-brand-light text-xs font-medium uppercase tracking-widest">Smart City</p>
        <p className="text-white text-sm font-medium mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-brand text-white'
                  : 'text-[#85B7EB] hover:text-white hover:bg-brand'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <SidebarUserMenu profilePath="/a/profile" />

    </aside>
  )
}