import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, Shield, Wrench } from 'lucide-react'

const CATEGORIES = [
  { role: 'citizen', label: 'Citizens', icon: Users, color: 'text-blue-500' },
  { role: 'officer', label: 'Officers', icon: Shield, color: 'text-purple-500' },
  { role: 'worker',  label: 'Workers',  icon: Wrench, color: 'text-amber-500' },
]

export default function AdminUsers() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .in('role', ['citizen', 'officer', 'worker'])

      if (data) {
        const result = {}
        data.forEach(p => {
          result[p.role] = (result[p.role] || 0) + 1
        })
        setCounts(result)
      }
      setLoading(false)
    }

    fetchCounts()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage registered users</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map(({ role, label, icon: Icon, color }) => (
          <button
            key={role}
            onClick={() => navigate(`/a/users/${role}`)}
            className="bg-white border border-gray-200 rounded-md p-5 text-left hover:border-brand hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-3xl font-medium text-brand">
              {loading ? '—' : (counts[role] || 0)}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}