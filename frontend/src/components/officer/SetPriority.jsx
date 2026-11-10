import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Flag } from 'lucide-react'

const LEVELS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function SetPriority({ complaint, onSaved }) {
  const [value, setValue] = useState(complaint.priority || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset when a different complaint is opened or its priority changes
  useEffect(() => {
    setValue(complaint.priority || '')
    setError('')
  }, [complaint.id, complaint.priority])

  // A resolved complaint is finished
  if (complaint.status === 'resolved') return null

  const unchanged = value === (complaint.priority || '')

  const handleSave = async () => {
    if (!value || unchanged) return

    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.rpc('set_complaint_priority', {
      p_complaint_id: complaint.id,
      p_priority: value,
    })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onSaved(value)
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">
        {complaint.priority
          ? 'Priority'
          : `Set the priority after reviewing the evidence${complaint.hazard_level ? ` · AI suggests ${complaint.hazard_level}` : ''}`}
      </p>

      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
        >
          <option value="">Select priority...</option>
          {LEVELS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={!value || unchanged || saving}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Flag size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}