import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import BackButton from '../../components/shared/BackButton'
import { Building2, ArrowRight, Mail } from 'lucide-react'

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

  useEffect(() => {
    if (!email) navigate('/authenticate')
  }, [email, navigate])

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
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
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
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const token = otp.join('')
    if (token.length < 6) { setError('Please enter the complete 6-digit code.'); return }

    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })

    if (error) {
      setError(error.message)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setLoading(false)
      return
    }

    const user = data.user

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role, is_disabled')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, role: 'citizen', is_disabled: false })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_disabled, profile_completion')
      .eq('id', user.id)
      .single()

    if (profile?.is_disabled) {
      await supabase.auth.signOut()
      setError('Your account has been disabled. Please contact the administrator.')
      setLoading(false)
      return
    }

    const role = profile?.role
    const completion = profile?.profile_completion || 0
    const basePath = role === 'admin' ? '/a' : role === 'officer' ? '/o' : role === 'worker' ? '/w' : '/c'

    navigate(completion === 0 ? `${basePath}/profile` : `${basePath}/dashboard`)
    setLoading(false)
  }

  const handleResend = async () => {
    setResending(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    setResending(false)
    if (error) { setError(error.message); return }

    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  // Timer percentage for visual ring
  const timerPercent = (resendTimer / 60) * 100

  return (
    <div className="relative min-h-screen bg-brand-surface flex items-center justify-center px-4 overflow-hidden">

      <BackButton to="/authenticate" />

      {/* Dot pattern — bottom right */}
      <div
        className="absolute bottom-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1A6B33 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 0%, transparent 65%)',
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
          <Mail size={15} className="text-brand flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Code sent to</p>
            <p className="text-sm font-medium text-brand-dark">{email}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-brand-dark">Verify your email</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your inbox</p>
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
              className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-md focus:outline-none transition-all duration-150 ${
                digit
                  ? 'border-brand bg-brand-surface text-brand'
                  : 'border-gray-200 text-brand-dark focus:border-brand focus:bg-brand-surface'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length < 6}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium py-2.5 rounded-md transition-all duration-200 disabled:opacity-60 active:scale-95"
        >
          {loading ? 'Verifying...' : 'Verify email'}
          {!loading && <ArrowRight size={14} />}
        </button>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {resendTimer > 0 ? (
            <div className="flex items-center gap-2">
              {/* Timer ring */}
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  <circle
                    cx="10" cy="10" r="8"
                    fill="none"
                    stroke="#185FA5"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - timerPercent / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                Resend in <span className="text-brand font-medium">{resendTimer}s</span>
              </p>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-brand hover:underline font-medium disabled:opacity-60 transition-colors"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}