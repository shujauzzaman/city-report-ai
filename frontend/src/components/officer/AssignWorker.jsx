import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { UserCheck } from 'lucide-react'

export default function AssignWorker({ complaint, onAssigned }) {
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchWorkers = async () => {
      // Get officer's department first
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', user.id)
        .single()

      if (!profile?.department) {
        setFetching(false)
        return
      }

      // Fetch workers in same department
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, department')
        .eq('role', 'worker')
        .eq('department', profile.department)

      if (data) setWorkers(data)
      setFetching(false)
    }

    fetchWorkers()
  }, [])

  const handleAssign = async () => {
    if (!selectedWorker) return

    setLoading(true)

    const { error } = await supabase
      .from('complaints')
      .update({
        assigned_worker_id: selectedWorker,
        status: 'in_progress',
      })
      .eq('id', complaint.id)

    setLoading(false)

    if (!error) onAssigned()
  }

  if (fetching) return (
    <p className="text-xs text-gray-400 text-center py-2">Loading workers...</p>
  )

  if (workers.length === 0) return (
    <p className="text-xs text-danger text-center py-2">No workers available in this department.</p>
  )

  // Already assigned
  if (complaint.assigned_worker_id) return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
      <UserCheck size={14} className="text-success" />
      <p className="text-xs text-success font-medium">Worker already assigned</p>
    </div>
  )

  return (
    <div className="flex gap-2">
      <select
        value={selectedWorker}
        onChange={(e) => setSelectedWorker(e.target.value)}
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
      >
        <option value="">Select a worker...</option>
        {workers.map(worker => (
        <option key={worker.id} value={worker.id}>
            {worker.full_name || 'Unnamed Worker'}
        </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading || !selectedWorker}
        className="flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        <UserCheck size={14} />
        {loading ? 'Assigning...' : 'Assign'}
      </button>
    </div>
  )
}