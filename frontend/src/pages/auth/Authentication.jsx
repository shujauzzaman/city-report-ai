import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import BackButton from '../../components/shared/BackButton'

export default function Authentication() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_disabled')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (profile?.is_disabled) {
      setError('Your account has been disabled. Please contact the administrator.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/verify-otp', { state: { email } })
  }

  return (
    <div className="relative min-h-screen bg-brand-surface flex items-center justify-center px-4 overflow-hidden">

      <BackButton to="/" />

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

        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">Welcome</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to sign in or create an account
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
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
            {loading ? 'Sending OTP...' : 'Continue'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          A one-time password will be sent to your email
        </p>

      </div>
    </div>
  )
}