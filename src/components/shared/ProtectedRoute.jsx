import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [redirect, setRedirect] = useState(null)

  useEffect(() => {
    const checkAuth = async (session) => {
      if (!session) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      // Role fetched from DB using JWT-verified user ID — never from localStorage
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      if (allowedRoles.includes(profile.role)) {
        setAuthorized(true)
      } else {
        setAuthorized(false)
        if (profile.role === 'admin') setRedirect('/a/dashboard')
        else if (profile.role === 'officer') setRedirect('/o/dashboard')
        else if (profile.role === 'worker') setRedirect('/w/dashboard')
        else if (profile.role === 'citizen') setRedirect('/c/dashboard')
        else setRedirect('/authenticate')
      }

      setLoading(false)
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuth(session)
    })

    // React to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkAuth(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Checking access...</p>
        </div>
      </div>
    )
  }

  if (redirect) return <Navigate to={redirect} replace />
  if (!authorized) return <Navigate to="/authenticate" replace />

  return children
}