import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Users, Shield, Wrench, UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'

const CATEGORIES = [
  { role: 'citizen', label: 'Citizens', icon: Users, color: 'text-blue-500' },
  { role: 'officer', label: 'Officers', icon: Shield, color: 'text-purple-500' },
  { role: 'worker',  label: 'Workers',  icon: Wrench, color: 'text-amber-500' },
]

const DEPARTMENTS = ['Infrastructure', 'Municipal', 'Traffic']

const inputClass =
  'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand'

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(bytes, b => chars[b % chars.length]).join('')
}

const roleLabel = (r) => r.charAt(0).toUpperCase() + r.slice(1)

export default function AdminUsers() {
  const navigate = useNavigate()
  const location = useLocation()

  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  // 'create' = brand-new account, 'change' = change the role of an existing account
  const [mode, setMode] = useState(location.state?.email ? 'change' : 'create')
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [role, setRole] = useState('officer')
  const [department, setDepartment] = useState('Infrastructure')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [created, setCreated] = useState(null) // login details shown once, for copying
  const [copied, setCopied] = useState(false)

  const loadCounts = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .in('role', ['citizen', 'officer', 'worker'])

    if (data) {
      const result = {}
      data.forEach(p => {
        result[p.role] = (result[p.role] || 0) + 1
      })
      setCounts(result)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCounts()
  }, [])

  const switchMode = (next) => {
    setMode(next)
    setMessage(null)
    setCreated(null)
    setPassword('')
    setRole('officer')
  }

  const handleCreate = async (cleanEmail) => {
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMessage({ type: 'error', text: 'Your session expired. Please sign in again.' })
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: cleanEmail, password, role, department }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMessage({ type: 'error', text: body.message || 'Could not create the account.' })
        return
      }

      setCreated({ email: cleanEmail, password })
      setMessage({ type: 'success', text: `Account created: ${roleLabel(role)} in ${department}.` })
      setEmail('')
      setPassword('')
      loadCounts()
    } catch {
      setMessage({
        type: 'error',
        text: 'Could not reach the server. If it has been idle, wait a minute and try again.',
      })
    }
  }

  const handleChange = async (cleanEmail) => {
    const { error } = await supabase.rpc('admin_set_staff', {
      p_email: cleanEmail,
      p_role: role,
      p_department: role === 'citizen' ? null : department,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setMessage({
      type: 'success',
      text: role === 'citizen'
        ? `${cleanEmail} is now a citizen.`
        : `${cleanEmail} is now ${roleLabel(role)} in ${department}.`,
    })
    setEmail('')
    loadCounts()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setCreated(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address.' })
      return
    }

    setSaving(true)
    if (mode === 'create') await handleCreate(cleanEmail)
    else await handleChange(cleanEmail)
    setSaving(false)
  }

  const handleCopy = async () => {
    const text =
      `Smart City Reporting System\n` +
      `Sign in: ${window.location.origin}/authenticate\n` +
      `Email: ${created.email}\n` +
      `Password: ${created.password}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage registered users</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map(({ role: cat, label, icon: Icon, color }) => (
          <button
            key={cat}
            onClick={() => navigate(`/a/users/${cat}`)}
            className="bg-white border border-gray-200 rounded-md p-5 text-left hover:border-brand hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-3xl font-medium text-brand">
              {loading ? '—' : (counts[cat] || 0)}
            </p>
          </button>
        ))}
      </div>

      {/* Create / change staff */}
      <div className="bg-white border border-gray-200 rounded-md p-5 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={15} className="text-brand" />
          <h2 className="text-sm font-medium text-brand-dark">Staff accounts</h2>
        </div>

        <div className="flex gap-2 mb-3">
          {[['create', 'New account'], ['change', 'Existing account']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchMode(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                mode === key
                  ? 'bg-brand text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {mode === 'create'
            ? 'Create a login for a new officer or worker. You send them the email and password yourself.'
            : 'Change the role of someone who already has an account.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="person@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`flex-1 ${inputClass}`}
            />

            {mode === 'create' && (
              <div className="relative md:w-72">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pr-10 ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          {mode === 'create' && (
            <button
              type="button"
              onClick={() => { setPassword(generatePassword()); setShowPassword(true) }}
              className="text-xs text-brand hover:underline"
            >
              Generate a password
            </button>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              <option value="officer">Officer</option>
              <option value="worker">Worker</option>
              {mode === 'change' && <option value="citizen">Citizen (remove staff access)</option>}
            </select>

            {role !== 'citizen' && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-brand hover:bg-brand-accent text-white text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-60"
            >
              {saving
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create account' : 'Save role')}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm rounded-md px-3 py-2 border ${
              message.type === 'success'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-red-600 bg-red-50 border-red-200'
            }`}
          >
            {message.text}
          </p>
        )}

        {created && (
          <div className="mt-4 bg-brand-surface border border-brand-light rounded-md p-4">
            <p className="text-xs text-gray-500 mb-2">
              Send these login details to the person yourself. The password is only shown here, now.
            </p>
            <div className="text-sm text-brand-dark space-y-0.5">
              <p>Email: <span className="font-medium">{created.email}</span></p>
              <p>Password: <span className="font-medium">{created.password}</span></p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand border border-brand-light bg-white hover:bg-brand hover:text-white px-3 py-1.5 rounded-md transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy login details'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}