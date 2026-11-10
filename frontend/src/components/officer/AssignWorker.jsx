import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { UserCheck } from 'lucide-react'

export default function AssignWorker({ complaint, onAssigned }) {
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'worker')
        .eq('department', complaint.department)

      if (data) setWorkers(data)
      setFetching(false)
    }

    fetchWorkers()
  }, [complaint.department])

  const handleAssign = async () => {
    if (!selectedWorker) return

    setLoading(true)
    setError('')

    const { error: assignError } = await supabase
      .from('complaints')
      .update({
        assigned_worker_id: selectedWorker,
        status: 'in_progress',
      })
      .eq('id', complaint.id)

    setLoading(false)

    if (assignError) {
      setError(assignError.message)
      return
    }

    onAssigned()
  }

  // The priority has to be set before a complaint can be assigned
  if (!complaint.priority) {
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Set the priority above first, then you can assign this complaint to a worker.
      </p>
    )
  }

  if (fetching) {
    return <p className="text-xs text-gray-400">Loading workers...</p>
  }

  if (workers.length === 0) {
    return (
      <p className="text-xs text-gray-400 bg-gray-50 rounded-md px-3 py-2">
        No workers available in this department.
      </p>
    )
  }

  if (complaint.assigned_worker_id) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
        <UserCheck size={14} className="text-emerald-600" />
        <p className="text-xs text-emerald-700 font-medium">Worker already assigned</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
        >
          <option value="">Select worker...</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>
              {w.full_name || w.email}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          disabled={!selectedWorker || loading}
          className="bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}