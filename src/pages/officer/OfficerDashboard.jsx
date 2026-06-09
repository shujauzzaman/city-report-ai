import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ClipboardList, Clock, CheckCircle, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ComplaintModal from '../../components/shared/ComplaintModal'

export default function OfficerDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 })
  const [recentComplaints, setRecentComplaints] = useState([])
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // Get officer's department
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

      // Fetch complaints for this department
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, image_url, created_at')
        .eq('department', profile.department)
        .order('created_at', { ascending: false })

      if (complaints) {
        setStats({
          total: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
        })
        setRecentComplaints(complaints.slice(0, 3))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">Officer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          Managing complaints for
          <span className="bg-brand-surface text-brand text-xs font-medium px-2 py-0.5 rounded-md border border-brand-light">
            {department}
          </span>
          department
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-3xl font-medium text-warning">{loading ? '—' : stats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Resolved</p>
          </div>
          <p className="text-3xl font-medium text-success">{loading ? '—' : stats.resolved}</p>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-brand-dark">Recent Complaints</h2>
          <Link to="/o/complaints" className="text-xs text-brand hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">No complaints in your department yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentComplaints.map(complaint => (
              <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)} className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                {complaint.image_url && (
                  <img
                    src={complaint.image_url}
                    alt="Complaint"
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {complaint.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {complaint.address || 'No location'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[complaint.priority] || priorityStyles.medium}`}>
                    {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[complaint.status] || statusStyles.pending}`}>
                    {complaint.status === 'in_progress' ? 'In Progress' : complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
                  </span>
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