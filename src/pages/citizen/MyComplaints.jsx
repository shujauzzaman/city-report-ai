import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePlus, MapPin, Calendar, Search, X, AlertTriangle, Activity } from 'lucide-react'
import ComplaintModal from '../../components/shared/ComplaintModal'
import useComplaints from '../../hooks/useComplaints'

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

export default function MyComplaints() {
  const { complaints, loading } = useComplaints()
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = complaints
  .filter(c => filter === 'all' ? true : c.status === filter)
  .filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.description?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-brand-dark">My Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your submitted complaints</p>
        </div>
        <Link
          to="/c/submit"
          className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <FilePlus size={15} />
          New complaint
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by description or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          {filter === 'all' && (
            <Link
              to="/c/submit"
              className="inline-block mt-3 text-sm text-brand hover:underline font-medium"
            >
              Submit your first complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(complaint => (
            <div
              key={complaint.id}
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 cursor-pointer hover:border-brand hover:shadow-sm transition-all"
            >
              {/* Image */}
              {complaint.image_url && (
                <img
                  src={complaint.image_url}
                  alt="Complaint"
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
              )}

              {/* Content */}
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
                  {new Date(complaint.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </div>

                {/* Badges */}
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[complaint.priority] || priorityStyles.medium}`}>
                    {complaint.priority}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[complaint.status] || statusStyles.pending}`}>
                    {complaint.status === 'in_progress' ? 'In Progress' : complaint.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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