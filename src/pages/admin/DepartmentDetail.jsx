import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import {
  ArrowLeft, MapPin, Calendar, AlertTriangle,
  Activity, Search, X, Trash2, Users, Wrench, ClipboardList
} from 'lucide-react'
import ComplaintModal from '../../components/shared/ComplaintModal'

const LIMIT = 10

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

export default function DepartmentDetail() {
  const { name } = useParams()
  const navigate = useNavigate()
  const department = name.charAt(0).toUpperCase() + name.slice(1)

  const [activeTab, setActiveTab] = useState('complaints')
  const [complaints, setComplaints] = useState([])
  const [officers, setOfficers] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(LIMIT)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch complaints
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at')
        .eq('department', department)
        .order('created_at', { ascending: false })

      // Fetch officers and workers
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, role, department, full_name')
        .eq('department', department)
        .in('role', ['officer', 'worker'])

      if (complaintsData) setComplaints(complaintsData)
      if (profilesData) {
        setOfficers(profilesData.filter(p => p.role === 'officer'))
        setWorkers(profilesData.filter(p => p.role === 'worker'))
      }

      setLoading(false)
    }

    fetchData()
  }, [department])

  // Delete complaint
  const handleDelete = async (e, complaintId) => {
    e.stopPropagation()

    if (confirmDelete !== complaintId) {
      setConfirmDelete(complaintId)
      return
    }

    setDeleting(complaintId)

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', complaintId)

    if (!error) {
      setComplaints(prev => prev.filter(c => c.id !== complaintId))
      setConfirmDelete(null)
    }

    setDeleting(null)
  }

  const filteredComplaints = complaints
    .filter(c => filter === 'all' ? true : c.status === filter)
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        c.description?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
      )
    })

  const visibleComplaints = filteredComplaints.slice(0, visibleCount)

  const tabs = [
    { key: 'complaints', label: 'Complaints', count: complaints.length, icon: ClipboardList },
    { key: 'officers', label: 'Officers', count: officers.length, icon: Users },
    { key: 'workers', label: 'Workers', count: workers.length, icon: Wrench },
  ]

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/a/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
        <h1 className="text-xl font-medium text-brand-dark">{department} Department</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage complaints, officers and workers
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Complaints</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : complaints.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Officers</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : officers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Workers</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : workers.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-brand text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints tab */}
      {activeTab === 'complaints' && (
        <div>
          {/* Search + filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description or address..."
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

            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setVisibleCount(LIMIT) }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white text-gray-600"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Complaints list */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
              <p className="text-sm text-gray-400">No complaints found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleComplaints.map(complaint => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 cursor-pointer hover:border-brand hover:shadow-sm transition-all"
                >
                  {complaint.image_url && (
                    <img
                      src={complaint.image_url}
                      alt="Complaint"
                      className="w-20 h-20 object-cover rounded-md shrink-0"
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

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
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

                      <button
                        onClick={(e) => handleDelete(e, complaint.id)}
                        disabled={deleting === complaint.id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors disabled:opacity-60 ${
                          confirmDelete === complaint.id
                            ? 'bg-danger text-white'
                            : 'text-danger border border-danger hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={12} />
                        {deleting === complaint.id ? 'Deleting...' : confirmDelete === complaint.id ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {visibleCount < filteredComplaints.length && (
                <button
                  onClick={() => setVisibleCount(v => v + LIMIT)}
                  className="w-full py-2.5 text-sm text-brand font-medium border border-brand-light bg-brand-surface hover:bg-brand hover:text-white rounded-md transition-colors"
                >
                  Load {Math.min(LIMIT, filteredComplaints.length - visibleCount)} more
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Officers tab */}
      {activeTab === 'officers' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : officers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
              <p className="text-sm text-gray-400">No officers in this department.</p>
            </div>
          ) : officers.map(officer => (
            <div key={officer.id} className="bg-white border border-gray-200 rounded-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-surface rounded-full flex items-center justify-center">
                  <Users size={15} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-dark">
                    {officer.full_name || 'Unnamed Officer'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Officer · {officer.department}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workers tab */}
      {activeTab === 'workers' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
              <p className="text-sm text-gray-400">No workers in this department.</p>
            </div>
          ) : workers.map(worker => (
            <div key={worker.id} className="bg-white border border-gray-200 rounded-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-surface rounded-full flex items-center justify-center">
                  <Wrench size={15} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-dark">
                    {worker.full_name || 'Unnamed Worker'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Worker · {worker.department}</p>
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