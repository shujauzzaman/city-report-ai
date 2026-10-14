import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import BackButton from '../../components/shared/BackButton'
import { getDestination } from '../../lib/authHelpers'

const DISABLED_MESSAGE = 'Your account has been disabled. Please contact the administrator.'

const COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in with your email and password',
    button: 'Sign in',
    loading: 'Signing in...',
  },
  register: {
    title: 'Create an account',
    subtitle: "We'll email you a code to verify your address",
    button: 'Send verification code',
    loading: 'Sending code...',
  },
  reset: {
    title: 'Reset your password',
    subtitle: "We'll email you a code to verify it's you",
    button: 'Send verification code',
    loading: 'Sending code...',
  },
}

export default function Authentication() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const copy = COPY[mode]

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setPassword('')
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    // Block disabled accounts before doing anything else
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_disabled')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (profile?.is_disabled) {
      setError(DISABLED_MESSAGE)
      setLoading(false)
      return
    }

    // Normal sign-in: email + password
    if (mode === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (signInError) {
        setError('Invalid email or password. If you haven\'t set a password yet, use "Forgot password?".')
        setLoading(false)
        return
      }

      const dest = await getDestination(data.user)
      setLoading(false)

      if (dest.disabled) {
        setError(DISABLED_MESSAGE)
        return
      }

      navigate(dest.path, { replace: true })
      return
    }

    // Create account + forgot password: verify the email with a one-time code first
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: mode === 'register' },
    })

    setLoading(false)

    if (otpError) {
      setError(
        otpError.message.includes('not allowed')
          ? 'No account found with this email. Create an account instead.'
          : otpError.message
      )
      return
    }

    navigate('/verify-otp', { state: { email: cleanEmail } })
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
          <h1 className="text-xl font-medium text-brand-dark">{copy.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
            />
          </div>

          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-xs text-brand hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
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
          )}

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
            {loading ? copy.loading : copy.button}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-brand font-medium hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-brand font-medium hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>

        {mode !== 'login' && (
          <p className="text-xs text-gray-400 text-center mt-3">
            A one-time code will be sent to your email
          </p>
        )}

      </div>
    </div>
  )
}