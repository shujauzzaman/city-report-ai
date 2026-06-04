import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('complaints')
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at')
        .eq('citizen_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setComplaints(data)
      setLoading(false)
    }

    fetchComplaints()
  }, [])

  // Derived data
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  const recentComplaints = complaints.slice(0, 3)

  return { complaints, recentComplaints, stats, loading }
}