import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, Users, Shield, Wrench, Search, X } from 'lucide-react'

const LIMIT = 10

const ROLE_META = {
  citizen: { label: 'Citizens', icon: Users,  color: 'text-blue-500'   },
  officer: { label: 'Officers', icon: Shield, color: 'text-purple-500' },
  worker:  { label: 'Workers',  icon: Wrench, color: 'text-amber-500'  },
}

export default function AdminUsersList() {
  const { role } = useParams()
  const navigate = useNavigate()
  const meta = ROLE_META[role]

  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [visibleCount, setVisibleCount] = useState(LIMIT)
  const [togglingId, setTogglingId]     = useState(null)
  const [confirmId, setConfirmId]       = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, is_disabled, created_at')
        .eq('role', role)
        .order('created_at', { ascending: false })

      if (data) setUsers(data)
      setLoading(false)
    }

    fetchUsers()
  }, [role])

  const handleToggle = async (e, user) => {
    e.stopPropagation()

    if (confirmId !== user.id) {
      setConfirmId(user.id)
      return
    }

    setConfirmId(null)
    setTogglingId(user.id)

    const { error } = await supabase
      .from('profiles')
      .update({ is_disabled: !user.is_disabled })
      .eq('id', user.id)

    if (!error) {
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, is_disabled: !u.is_disabled } : u)
      )
    }

    setTogglingId(null)
  }

  const filtered = users.filter(u => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  const visible = filtered.slice(0, visibleCount)

  if (!meta) return null

  const Icon = meta.icon

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/a/users')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Users
        </button>
        <div className="flex items-center gap-2">
          <Icon size={18} className={meta.color} />
          <h1 className="text-xl font-medium text-brand-dark">{meta.label}</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? '—' : filtered.length} {meta.label.toLowerCase()} found
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search by name or email...`}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(LIMIT) }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading {meta.label.toLowerCase()}...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
          <p className="text-sm text-gray-400">No {meta.label.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(user => (
            <div
              key={user.id}
              className={`bg-white border border-gray-200 rounded-md p-5 flex items-center justify-between transition-all ${user.is_disabled ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-surface rounded-full flex items-center justify-center shrink-0">
                  <Icon size={15} className={meta.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-dark">
                    {user.full_name || 'Unnamed User'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email || '—'}</p>
                  {user.department && (
                    <p className="text-xs text-gray-400">{user.department}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${user.is_disabled ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <span className={`text-xs ${user.is_disabled ? 'text-red-500' : 'text-emerald-500'}`}>
                    {user.is_disabled ? 'Disabled' : 'Active'}
                  </span>
                </div>

                {/* Disable / Enable button */}
                <button
                  onClick={(e) => handleToggle(e, user)}
                  disabled={togglingId === user.id}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-60 ${
                    confirmId === user.id
                      ? user.is_disabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-danger text-white'
                      : user.is_disabled
                        ? 'text-emerald-600 border border-emerald-300 hover:bg-emerald-50'
                        : 'text-danger border border-danger hover:bg-red-50'
                  }`}
                >
                  {togglingId === user.id
                    ? '...'
                    : confirmId === user.id
                      ? 'Confirm?'
                      : user.is_disabled ? 'Re-enable' : 'Disable'}
                </button>
              </div>
            </div>
          ))}

          {/* Load more */}
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount(v => v + LIMIT)}
              className="w-full py-2.5 text-sm text-brand font-medium border border-brand-light bg-brand-surface hover:bg-brand hover:text-white rounded-md transition-colors"
            >
              Load {Math.min(LIMIT, filtered.length - visibleCount)} more
            </button>
          )}
        </div>
      )}
    </div>
  )
}