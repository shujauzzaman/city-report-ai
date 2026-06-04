import { useEffect } from 'react'
import { MapPin, Calendar, Clock, Building2, AlertTriangle, Activity } from 'lucide-react'

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

export default function ComplaintModal({ complaint, onClose }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* Image */}
        {complaint.image_url && (
          <img
            src={complaint.image_url}
            alt="Complaint"
            className="w-full h-56 object-cover rounded-t-md"
          />
        )}

        {/* Content */}
        <div className="px-5 py-5 space-y-4">

          {/* Badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Priority</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[complaint.priority] || priorityStyles.medium}`}>
                {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <Activity size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Status</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[complaint.status] || statusStyles.pending}`}>
                {complaint.status === 'in_progress' ? 'In Progress' : complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {complaint.description || 'No description provided.'}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="text-brand mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{complaint.address || 'No location provided.'}</p>
            </div>
            {complaint.latitude && complaint.longitude && (
              <p className="text-xs text-gray-400 mt-1 ml-5">
                GPS: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
              </p>
            )}
          </div>

          {/* Department */}
          {complaint.department && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Department</p>
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="text-brand" />
                <p className="text-sm text-gray-700">{complaint.department}</p>
              </div>
            </div>
          )}

          {/* Date & time */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Submitted</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-brand" />
                <p className="text-sm text-gray-700">
                  {new Date(complaint.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-brand" />
                <p className="text-sm text-gray-700">
                  {new Date(complaint.created_at + 'Z').toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-500 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}