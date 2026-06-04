import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import BackButton from '../../components/shared/BackButton'
import Authentication from '../auth/Authentication'

export default function OTPVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)

  const inputRefs = useRef([])

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/authenticate')
  }, [email, navigate])

  // Countdown timer
  useEffect(() => {
    if (resendTimer === 0) return
    const timer = setTimeout(() => setResendTimer(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char
    })
    setOtp(newOtp)

    const lastIndex = Math.min(pasted.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const token = otp.join('')

    if (token.length < 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setLoading(false)
      return
    }

    const user = data.user

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      // New user — create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'citizen',
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      navigate('/c/dashboard')
    } else {
      // Returning user — route by role
      const role = existingProfile.role
      if (role === 'admin') navigate('/a/dashboard')
      else if (role === 'officer') navigate('/o/dashboard')
      else if (role === 'worker') navigate('/w/dashboard')
      else navigate('/c/dashboard')
    }

    setLoading(false)
  }

  const handleResend = async () => {
    setResending(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setResending(false)

    if (error) {
      setError(error.message)
      return
    }

    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="relative min-h-screen bg-brand-surface flex items-center justify-center px-4">
        <BackButton to="/authenticate" />
      <div className="bg-white border border-gray-200 rounded-md p-8 w-full max-w-md">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            We sent a 6-digit code to{' '}
            <span className="text-brand font-medium">{email}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand transition-colors"
            />
          ))}
        </div>

        {/* Error (YOUR ORIGINAL THEME RESTORED) */}
        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length < 6}
          className="w-full bg-brand hover:bg-brand-accent text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify email'}
        </button>

        {/* Resend */}
        <div className="text-center mt-5">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-400">
              Resend code in{' '}
              <span className="text-brand font-medium">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-brand hover:underline font-medium disabled:opacity-60"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}