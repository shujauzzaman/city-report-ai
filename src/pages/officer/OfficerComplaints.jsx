import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { MapPin, Calendar, AlertTriangle, Activity } from 'lucide-react'
import ComplaintModal from '../../components/shared/ComplaintModal'
import AssignWorker from '../../components/officer/AssignWorker'

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

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [department, setDepartment] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', user.id)
        .single()

      if (!profile?.department) {
        setLoading(false)
        return
      }

      setDepartment(profile.department)

      const { data } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at, assigned_worker_id')
        .eq('department', profile.department)
        .order('created_at', { ascending: false })

      if (data) setComplaints(data)
      setLoading(false)
    }

    fetchComplaints()
  }, [])

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter)

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-brand-dark">Complaints</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            Department:
            <span className="bg-brand-surface text-brand text-xs font-medium px-2 py-0.5 rounded-md border border-brand-light">
              {department || '—'}
            </span>
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'in_progress', 'resolved'].map(tab => (
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

      {/* Complaints list */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
          <p className="text-sm text-gray-400">No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(complaint => (
            <div
              key={complaint.id}
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 cursor-pointer hover:border-brand hover:shadow-sm transition-all"
            >
              {complaint.image_url && (
                <img
                  src={complaint.image_url}
                  alt="Complaint"
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {complaint.description || 'No description'}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin size={11} />
                  <span className="truncate">{complaint.address || 'No location'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5">
                  <Calendar size={11} />
                  {new Date(complaint.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </div>

                <div className="flex gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={10} className="text-gray-400" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[complaint.priority] || priorityStyles.medium}`}>
                      {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={10} className="text-gray-400" />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[complaint.status] || statusStyles.pending}`}>
                      {complaint.status === 'in_progress' ? 'In Progress' : complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
                    </span>
                  </div>
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
          actions={
            <AssignWorker
              complaint={selectedComplaint}
              onAssigned={() => {
                // Update complaint in list
                setComplaints(prev =>
                  prev.map(c =>
                    c.id === selectedComplaint.id
                      ? { ...c, status: 'in_progress', assigned_worker_id: true }
                      : c
                  )
                )
                setSelectedComplaint(null)
              }}
            />
          }
        />
      )}
    </div>
  )
}