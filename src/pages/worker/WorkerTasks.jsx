import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { MapPin, Calendar, AlertTriangle, Activity, CheckCircle } from 'lucide-react'
import ComplaintModal from '../../components/shared/ComplaintModal'

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

export default function WorkerTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at')
        .eq('assigned_worker_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setTasks(data)
      setLoading(false)
    }

    fetchTasks()
  }, [])

  // E4-US5 — Update task status
  const handleMarkResolved = async (e, taskId) => {
    e.stopPropagation() // prevent modal from opening
    setUpdating(taskId)

    const { error } = await supabase
      .from('complaints')
      .update({ status: 'resolved' })
      .eq('id', taskId)

    if (!error) {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: 'resolved' } : t)
      )
    }

    setUpdating(null)
  }

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">Complaints assigned to you</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'in_progress', 'resolved'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              filter === tab
                ? 'bg-brand text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
            }`}
          >
            {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
          <p className="text-sm text-gray-400">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedComplaint(task)}
              className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 cursor-pointer hover:border-brand hover:shadow-sm transition-all"
            >
              {task.image_url && (
                <img
                  src={task.image_url}
                  alt="Task"
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {task.description || 'No description'}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin size={11} />
                  <span className="truncate">{task.address || 'No location'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5">
                  <Calendar size={11} />
                  {new Date(task.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
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

                  {/* E4-US5 — Mark as resolved button */}
                  {task.status !== 'resolved' && (
                    <button
                      onClick={(e) => handleMarkResolved(e, task.id)}
                      disabled={updating === task.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-success border border-success px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle size={12} />
                      {updating === task.id ? 'Updating...' : 'Mark resolved'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  )
}