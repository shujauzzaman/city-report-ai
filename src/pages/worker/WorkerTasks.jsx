import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { MapPin, Calendar, AlertTriangle, Activity, CheckCircle, ImagePlus, X, FileText } from 'lucide-react'
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

// Resolution proof modal
function ResolveModal({ task, onClose, onResolved }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload a resolution proof image.')
      return
    }

    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Upload proof image
    const fileExt = image.name.split('.').pop()
    const fileName = `resolution/${task.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(fileName, image)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(fileName)

    // Update complaint
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status: 'resolved',
        resolution_proof_url: publicUrl,
        resolution_notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    onResolved(task.id, publicUrl, notes.trim())
    onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-md w-full max-w-md scrollbar-hide overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-brand-dark">Upload Resolution Proof</h2>
          <p className="text-xs text-gray-400 mt-0.5">Provide evidence that the issue has been resolved</p>
        </div>

        <div className="px-5 py-5 space-y-4">

          {/* Proof image */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <ImagePlus size={14} className="text-brand" />
              Resolution Proof Image <span className="text-danger">*</span>
            </label>

            {!imagePreview ? (
              <div
                onClick={() => document.getElementById('proof-input').click()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-brand transition-colors cursor-pointer"
              >
                <ImagePlus size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Click to upload proof image
                </p>
                <input
                  id="proof-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Proof"
                  className="w-full h-48 object-cover rounded-md"
                />
                <button
                  onClick={() => { setImage(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 flex items-center gap-1 bg-white border border-gray-200 text-gray-500 hover:text-danger text-xs px-2 py-1 rounded-md"
                >
                  <X size={12} />
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FileText size={14} className="text-brand" />
              Resolution Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what was done to resolve the issue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-success hover:opacity-90 text-white text-sm font-medium py-2 rounded-md transition-opacity disabled:opacity-60"
          >
            <CheckCircle size={14} />
            {loading ? 'Submitting...' : 'Submit Resolution'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-500 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}

export default function WorkerTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [resolvingTask, setResolvingTask] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at, resolution_proof_url, resolution_notes')
        .eq('assigned_worker_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setTasks(data)
      setLoading(false)
    }

    fetchTasks()
  }, [])

  const handleResolved = (taskId, proofUrl, notes) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId
        ? { ...t, status: 'resolved', resolution_proof_url: proofUrl, resolution_notes: notes }
        : t
      )
    )
  }

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  return (
    <div className="max-w-2xl mx-auto">

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

                  {/* Mark resolved button */}
                  {task.status !== 'resolved' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setResolvingTask(task) }}
                      className="flex items-center gap-1.5 text-xs font-medium text-success border border-success px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                    >
                      <CheckCircle size={12} />
                      Mark resolved
                    </button>
                  )}

                  {/* Resolved indicator */}
                  {task.status === 'resolved' && task.resolution_proof_url && (
                    <span className="text-xs text-success flex items-center gap-1">
                      <CheckCircle size={12} />
                      Proof uploaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint detail modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}

      {/* Resolve modal */}
      {resolvingTask && (
        <ResolveModal
          task={resolvingTask}
          onClose={() => setResolvingTask(null)}
          onResolved={handleResolved}
        />
      )}

    </div>
  )
}