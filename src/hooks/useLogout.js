import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function useLogout() {
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/authenticate', { replace: true })
  }

  return logout
}