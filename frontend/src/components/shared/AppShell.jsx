import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import NotificationBell from './NotificationBell'

// Shared page frame for every role: the sidebar slides in on phones and
// stays visible from tablets up, followed by the top bar and the page.
export default function AppShell({ Sidebar }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the menu after the user picks a page
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-brand-surface">

      {/* Dark backdrop behind the open menu (phones only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-56 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 md:ml-56">
        <div className="mx-auto w-full max-w-6xl min-h-screen flex flex-col">

          {/* Top bar */}
          <div className="flex items-center justify-between md:justify-end px-4 sm:px-8 py-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-md text-brand-dark hover:bg-white"
            >
              <Menu size={22} />
            </button>
            <NotificationBell />
          </div>

          {/* Page content */}
          <main className="flex-1 px-4 sm:px-8 pb-8">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  )
}