import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getDestination } from '../../lib/authHelpers'
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react'

export default function SetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // This page only makes sense right after the email was verified
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/authenticate', { replace: true })
      else setEmail(session.user.email)
    })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    const dest = await getDestination(data.user)
    setLoading(false)

    if (dest.disabled) {
      setError('Your account has been disabled. Please contact the administrator.')
      return
    }

    navigate(dest.path, { replace: true })
  }

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white'

  return (
    <div className="relative min-h-screen bg-brand-surface flex items-center justify-center px-4 overflow-hidden">

      {/* Dot pattern — bottom right corner only, fades out */}
      <div
        className="absolute bottom-0 right-0 w-150 h-150 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1A6B33 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 70%)',
          opacity: 1,
        }}
      />

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-md p-8 w-full max-w-md shadow-lg relative z-10">

        {/* Branding */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <img src="/logo.png" alt="Smart City Logo" className="h-15 w-auto" />
          <div>
            <p className="text-sm font-bold text-brand-dark leading-tight">Smart City</p>
            <p className="text-xs text-gray-400 leading-tight">Reporting System</p>
          </div>
        </div>

        {/* Email indicator */}
        <div className="flex items-center gap-3 bg-brand-surface border border-brand-light rounded-md px-3 py-2.5 mb-6">
          <Lock size={15} className="text-brand flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Email verified</p>
            <p className="text-sm font-medium text-brand-dark">{email}</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">Set your password</h1>
          <p className="text-sm text-gray-500 mt-1">
            You'll use this with your email to sign in next time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium py-2.5 rounded-md transition-all duration-200 disabled:opacity-60 active:scale-95"
          >
            {loading ? 'Saving...' : 'Save password & continue'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

      </div>
    </div>
  )
}