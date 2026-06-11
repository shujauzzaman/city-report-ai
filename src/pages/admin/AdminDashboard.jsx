import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, Clock, CheckCircle, AlertTriangle,
  Building2, Users, Wrench, ChevronRight
} from 'lucide-react'

const DEPARTMENTS = ['Infrastructure', 'Municipal', 'Traffic']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [systemStats, setSystemStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 })
  const [deptStats, setDeptStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all complaints
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, status, department')

      // Fetch all profiles (officers + workers)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role, department')
        .in('role', ['officer', 'worker'])

      if (complaints) {
        // System-wide stats
        setSystemStats({
          total: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          in_progress: complaints.filter(c => c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
        })

        // Per department stats
        const stats = {}
        DEPARTMENTS.forEach(dept => {
          const deptComplaints = complaints.filter(c => c.department === dept)
          const deptProfiles = profiles?.filter(p => p.department === dept) || []

          stats[dept] = {
            complaints: deptComplaints.length,
            pending: deptComplaints.filter(c => c.status === 'pending').length,
            resolved: deptComplaints.filter(c => c.status === 'resolved').length,
            officers: deptProfiles.filter(p => p.role === 'officer').length,
            workers: deptProfiles.filter(p => p.role === 'worker').length,
          }
        })

        setDeptStats(stats)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-brand-dark">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide overview</p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
          </div>
          <p className="text-3xl font-medium text-brand">{loading ? '—' : systemStats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-3xl font-medium text-warning">{loading ? '—' : systemStats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">In Progress</p>
          </div>
          <p className="text-3xl font-medium text-amber-500">{loading ? '—' : systemStats.in_progress}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Resolved</p>
          </div>
          <p className="text-3xl font-medium text-success">{loading ? '—' : systemStats.resolved}</p>
        </div>
      </div>

      {/* Departments section */}
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={16} className="text-brand" />
        <h2 className="text-sm font-medium text-brand-dark">Departments</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {DEPARTMENTS.map(dept => (
          <div
            key={dept}
            onClick={() => navigate(`/a/department/${dept.toLowerCase()}`)}
            className="bg-white border border-gray-200 rounded-md p-5 cursor-pointer hover:border-brand hover:shadow-sm transition-all group"
          >
            {/* Dept header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-surface rounded-md flex items-center justify-center">
                  <Building2 size={15} className="text-brand" />
                </div>
                <h3 className="text-sm font-medium text-brand-dark">{dept}</h3>
              </div>
              <ChevronRight size={15} className="text-gray-400 group-hover:text-brand transition-colors" />
            </div>

            {/* Dept stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <BarChart2 size={11} />
                  Complaints
                </div>
                <span className="text-xs font-medium text-brand">
                  {loading ? '—' : deptStats[dept]?.complaints ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={11} />
                  Pending
                </div>
                <span className="text-xs font-medium text-warning">
                  {loading ? '—' : deptStats[dept]?.pending ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle size={11} />
                  Resolved
                </div>
                <span className="text-xs font-medium text-success">
                  {loading ? '—' : deptStats[dept]?.resolved ?? 0}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-2 mt-2 flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users size={11} />
                  <span>{loading ? '—' : deptStats[dept]?.officers ?? 0} Officers</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Wrench size={11} />
                  <span>{loading ? '—' : deptStats[dept]?.workers ?? 0} Workers</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}