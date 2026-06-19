import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
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

    // Check if account exists and is disabled
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
      options: {
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/verify-otp', { state: { email } })
  }

  return (
    <div className="relative min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <BackButton to="/" />
      <div className="bg-white border border-gray-200 rounded-md p-8 w-full max-w-md">

        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">
            Authenticate
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to continue
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand"
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
            className="w-full bg-brand hover:bg-brand-accent text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>

        </form>
      </div>
    </div>
  )
}