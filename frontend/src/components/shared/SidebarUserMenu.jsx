import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { User, LogOut, ChevronUp } from 'lucide-react'
import useLogout from '../../hooks/useLogout'

export default function SidebarUserMenu({ profilePath }) {
  const [profile, setProfile] = useState({ full_name: '', role: '' })
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)
  const menuRef = useRef()
  const navigate = useNavigate()
  const logout = useLogout()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user.email)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    fetchProfile()
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const getInitials = () => {
    if (profile.full_name?.trim()) {
      return profile.full_name
        .trim()
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.charAt(0).toUpperCase() || '?'
  }

  const roleLabel = {
    citizen: 'Citizen',
    officer: 'Officer',
    worker: 'Worker',
    admin: 'Administrator',
  }

  return (
    <div
      ref={menuRef}
      className="px-3 py-4 border-t border-[#1A6B33] relative"
    >
      {/* Dropdown menu */}
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-md border border-gray-200 shadow-lg overflow-hidden">
          <button
            onClick={() => { navigate(profilePath); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-brand-surface hover:text-brand transition-colors"
          >
            <User size={14} />
            My Profile
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1A6B33] transition-colors group"
      >
        {/* Avatar / initials */}
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
          {getInitials()}
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium text-white truncate">
            {profile.full_name || email || 'User'}
          </p>
          <p className="text-xs text-brand-light truncate">
            {roleLabel[profile.role] || profile.role}
          </p>
        </div>

        {/* Chevron */}
        <ChevronUp
          size={14}
          className={`text-brand-light shrink-0 transition-transform ${open ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>
    </div>
  )
}