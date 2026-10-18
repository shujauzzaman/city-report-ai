import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ArrowRightLeft } from 'lucide-react'

const DEPARTMENTS = ['Infrastructure', 'Municipal', 'Traffic']

export default function MoveDepartment({ complaint, onMoved }) {
  const [target, setTarget] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // A resolved complaint is finished, so there is nothing to move
  if (complaint.status === 'resolved') return null

  const options = DEPARTMENTS.filter(d => d !== complaint.department)

  const handleMove = async () => {
    if (!target) return

    // Two-step confirmation, like the other destructive actions
    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    setError('')

    const { error: moveError } = await supabase.rpc('move_complaint_department', {
      p_complaint_id: complaint.id,
      p_department: target,
    })

    setLoading(false)
    setConfirming(false)

    if (moveError) {
      setError(moveError.message)
      return
    }

    onMoved(target)
  }

  return (
    <div className="border-t border-gray-100 pt-3">
      <p className="text-xs text-gray-400 mb-2">Wrong department?</p>

      <div className="flex gap-2">
        <select
          value={target}
          onChange={(e) => { setTarget(e.target.value); setConfirming(false); setError('') }}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
        >
          <option value="">Move to...</option>
          {options.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleMove}
          disabled={!target || loading}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
            confirming
              ? 'bg-danger text-white'
              : 'border border-gray-300 text-gray-600 hover:border-brand hover:text-brand'
          }`}
        >
          <ArrowRightLeft size={14} />
          {loading ? 'Moving...' : confirming ? 'Confirm?' : 'Move'}
        </button>
      </div>

      {confirming && complaint.assigned_worker_id && (
        <p className="text-xs text-gray-400 mt-1.5">
          The assigned worker will be removed from this complaint.
        </p>
      )}

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}