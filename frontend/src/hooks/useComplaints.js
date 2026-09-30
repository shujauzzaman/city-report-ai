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
        .select('id, description, status, priority, address, latitude, longitude, image_url, department, created_at, resolution_proof_url, resolution_notes, issue_type, hazard_level, detection_confidence, box_x1, box_y1, box_x2, box_y2')
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