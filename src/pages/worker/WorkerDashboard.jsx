import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { BarChart2, Clock, CheckCircle } from 'lucide-react'
import ComplaintModal from '../../components/shared/ComplaintModal'
import { MapPin, Calendar, AlertTriangle, Activity } from 'lucide-react'

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const statusStyles = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
}

export default function WorkerDashboard() {
  const [stats, setStats] = useState({ total: 0, in_progress: 0, resolved: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('department, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.department) setDepartment(profile.department)

      const { data: tasks } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, image_url, department, latitude, longitude, created_at')
        .eq('assigned_worker_id', user.id)
        .order('created_at', { ascending: false })

      if (tasks) {
        setStats({
          total: tasks.length,
          in_progress: tasks.filter(t => t.status === 'in_progress').length,
          resolved: tasks.filter(t => t.status === 'resolved').length,
        })
        setRecentTasks(tasks.slice(0, 3))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">Worker Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          Department:
          <span className="bg-brand-surface text-brand text-xs font-medium px-2 py-0.5 rounded-md border border-brand-light">
            {department || '—'}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tasks</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">In Progress</p>
          </div>
          <p className="text-3xl font-medium text-warning">{loading ? '—' : stats.in_progress}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Resolved</p>
          </div>
          <p className="text-3xl font-medium text-success">{loading ? '—' : stats.resolved}</p>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-brand-dark">Recent Tasks</h2>
          <Link to="/w/tasks" className="text-xs text-brand hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedComplaint(task)}
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {task.image_url && (
                  <img
                    src={task.image_url}
                    alt="Task"
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {task.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={10} />
                    <span className="truncate">{task.address || 'No location'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5">
                    <Calendar size={10} />
                    {new Date(task.created_at + 'Z').toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={10} className="text-gray-400" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={10} className="text-gray-400" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[task.status] || statusStyles.pending}`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  )
}