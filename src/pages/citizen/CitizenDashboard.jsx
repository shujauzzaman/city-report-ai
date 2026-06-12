import { Link } from 'react-router-dom'
import { FilePlus, Clock, CheckCircle, BarChart2 } from 'lucide-react'
import useComplaints from '../../hooks/useComplaints'
import ComplaintModal from '../../components/shared/ComplaintModal'
import { useState } from 'react'
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

export default function CitizenDashboard() {
  const { stats, recentComplaints, loading } = useComplaints()
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Submitted</p>
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

      {/* Quick action */}
      <div className="bg-white border border-gray-200 rounded-md p-6 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-medium text-brand-dark">Report an issue in your city</h2>
          <p className="text-xs text-gray-400 mt-1">
            Upload an image and we'll route it to the right department
          </p>
        </div>
        <Link
          to="/c/submit"
          className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
        >
          <FilePlus size={15} />
          Submit complaint
        </Link>
      </div>

      {/* Recent complaints */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-brand-dark">Recent Complaints</h2>
          <Link to="/c/complaints" className="text-xs text-brand hover:underline">
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
            <p className="text-sm text-gray-400">No complaints submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentComplaints.map(complaint => (
              <div
                key={complaint.id}
                onClick={() => setSelectedComplaint(complaint)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  {complaint.image_url && (
                    <img
                      src={complaint.image_url}
                      alt="Complaint"
                      className="w-12 h-12 object-cover rounded-md shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {complaint.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={10} />
                      <span className="truncate">{complaint.address || 'No location'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5">
                      <Calendar size={10} />
                      {new Date(complaint.created_at + 'Z').toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4 items-end">
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
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  )
}