import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ComplaintModal from '../../components/shared/ComplaintModal'
import { Search, X, Download, MapPin, Calendar } from 'lucide-react'

const COLUMNS =
  'id, description, status, priority, address, latitude, longitude, image_url, department, created_at, citizen_id, assigned_worker_id, resolution_proof_url, resolution_notes, issue_type, hazard_level, detection_confidence, box_x1, box_y1, box_x2, box_y2'

const DEPARTMENTS = ['Infrastructure', 'Municipal', 'Traffic']
const CELL = 0.01 // degrees: roughly 1 km, so each area is about 1 km across
const LIST_STEP = 20
const AREAS_SHOWN = 10

const issueLabels = {
  pothole: 'Pothole',
  garbage: 'Garbage / Waste',
  open_manhole: 'Open Manhole',
  accident: 'Accident',
  road_damage: 'Road Damage',
  unknown: 'Not identified',
}
const issueLabel = (t) => issueLabels[t] || t || 'Not identified'

const statusStyles = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
}
const statusLabels = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const inputClass =
  'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand'

// Read a whole table, 1000 rows at a time (the server returns at most 1000 per request)
const fetchAll = async (table, columns) => {
  const PAGE = 1000
  const rows = []
  for (let from = 0; ; from += PAGE) {
    const { data } = await supabase
      .from(table)
      .select(columns)
      .order('id')
      .range(from, from + PAGE - 1)
    if (!data) break
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

const countBy = (items, fn) => {
  const counts = new Map()
  items.forEach((i) => {
    const k = fn(i)
    counts.set(k, (counts.get(k) || 0) + 1)
  })
  return counts
}

const topOf = (items, fn) => {
  let best = null
  countBy(items, fn).forEach((n, k) => {
    if (!best || n > best.n) best = { k, n }
  })
  return best ? best.k : ''
}

const avg = (nums) => nums.reduce((s, n) => s + n, 0) / nums.length

// Complaints inside the same ~1 km square belong to the same area
const areaKey = (c) => {
  const lat = Number(c.latitude)
  const lon = Number(c.longitude)
  if (c.latitude == null || c.longitude == null || Number.isNaN(lat) || Number.isNaN(lon)) return 'none'
  return `${Math.floor(lat / CELL)}_${Math.floor(lon / CELL)}`
}

const SKIP = new Set([
  'pakistan', 'pk', 'islamabad capital territory', 'punjab', 'sindh',
  'khyber pakhtunkhwa', 'balochistan', 'azad kashmir', 'gilgit-baltistan',
])

const addressParts = (address) =>
  (address || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !/^[\d.\s-]+$/.test(s) && !SKIP.has(s.toLowerCase()))

// Name an area after the road/neighbourhood names that appear most in its addresses
const areaLabel = (items, lat, lon) => {
  const counts = new Map()
  items.forEach((c) =>
    addressParts(c.address).forEach((part, pos) => {
      const e = counts.get(part)
      if (e) {
        e.n += 1
        e.pos = Math.min(e.pos, pos)
      } else {
        counts.set(part, { n: 1, pos })
      }
    })
  )
  const top = [...counts.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[1].pos - b[1].pos)
    .slice(0, 2)
    .map(([part]) => part)
  return top.length ? top.join(', ') : `${lat.toFixed(3)}, ${lon.toFixed(3)}`
}

const buildAreas = (list) => {
  const groups = new Map()
  list.forEach((c) => {
    const key = areaKey(c)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(c)
  })

  return [...groups.entries()]
    .map(([key, items]) => {
      const located = key !== 'none'
      const lat = located ? avg(items.map((i) => Number(i.latitude))) : null
      const lon = located ? avg(items.map((i) => Number(i.longitude))) : null
      return {
        key,
        name: located ? areaLabel(items, lat, lon) : 'Location not recorded',
        lat,
        lon,
        items,
        total: items.length,
        pending: items.filter((i) => i.status === 'pending').length,
        in_progress: items.filter((i) => i.status === 'in_progress').length,
        resolved: items.filter((i) => i.status === 'resolved').length,
        topIssue: issueLabel(topOf(items, (i) => i.issue_type)),
      }
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}

// CSV helpers (text cells are protected against spreadsheet formulas)
const csvText = (v) => {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@]/.test(s)) s = "'" + s
  return `"${s.replace(/"/g, '""')}"`
}
const csvNum = (v) => (v == null ? '' : String(v))

export default function AdminReports() {
  const [complaints, setComplaints] = useState([])
  const [citizens, setCitizens] = useState({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [selectedKey, setSelectedKey] = useState(null)
  const [showAllAreas, setShowAllAreas] = useState(false)
  const [visible, setVisible] = useState(LIST_STEP)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [rows, profiles] = await Promise.all([
        fetchAll('complaints', COLUMNS),
        fetchAll('profiles', 'id, full_name, email'),
      ])
      const map = {}
      profiles.forEach((p) => { map[p.id] = p })
      setCitizens(map)
      setComplaints(rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))))
      setLoading(false)
    }
    load()
  }, [])

  // Department, date range and search all narrow the same set of complaints
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return complaints.filter((c) => {
      if (department && c.department !== department) return false
      const day = String(c.created_at).slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      if (!q) return true
      const citizen = citizens[c.citizen_id]
      return [c.address, c.description, citizen?.full_name, citizen?.email].some((v) =>
        v?.toLowerCase().includes(q)
      )
    })
  }, [complaints, citizens, search, department, from, to])

  const areas = useMemo(() => buildAreas(filtered), [filtered])

  const stats = useMemo(
    () => ({
      total: filtered.length,
      pending: filtered.filter((c) => c.status === 'pending').length,
      in_progress: filtered.filter((c) => c.status === 'in_progress').length,
      resolved: filtered.filter((c) => c.status === 'resolved').length,
    }),
    [filtered]
  )

  const selectedArea = areas.find((a) => a.key === selectedKey) || null
  const listed = selectedArea ? selectedArea.items : filtered
  const maxTotal = areas.length ? areas[0].total : 1
  const shownAreas = showAllAreas ? areas : areas.slice(0, AREAS_SHOWN)

  const hasFilters = department || from || to
  const emptyMessage =
    search.trim() || !hasFilters ? 'No complaints found.' : 'No data for the selected period'

  const handleDownload = () => {
    const header = ['Rank', 'Area', 'Latitude', 'Longitude', 'Complaints', 'Pending', 'In Progress', 'Resolved', 'Most common issue']
    const rows = areas.map((a, i) =>
      [
        csvNum(i + 1),
        csvText(a.name),
        csvNum(a.lat == null ? '' : a.lat.toFixed(5)),
        csvNum(a.lon == null ? '' : a.lon.toFixed(5)),
        csvNum(a.total),
        csvNum(a.pending),
        csvNum(a.in_progress),
        csvNum(a.resolved),
        csvText(a.topIssue),
      ].join(',')
    )
    rows.push(
      [
        '',
        csvText('Total'),
        '',
        '',
        csvNum(stats.total),
        csvNum(stats.pending),
        csvNum(stats.in_progress),
        csvNum(stats.resolved),
        '',
      ].join(',')
    )

    const csv = [header.map(csvText).join(','), ...rows].join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `complaints-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setDepartment('')
    setFrom('')
    setTo('')
  }

  const breakdown = (items, fn) =>
    [...countBy(items, fn).entries()].sort((a, b) => b[1] - a[1])

  return (
    <div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-brand-dark">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find complaints and see which areas have the most
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white border border-gray-200 rounded-md p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, road, address, name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(LIST_STEP) }}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setVisible(LIST_STEP) }}
              className={inputClass}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setVisible(LIST_STEP) }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setVisible(LIST_STEP) }}
              className={inputClass}
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-brand hover:underline pb-2.5"
            >
              Clear filters
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={filtered.length === 0}
            className="sm:ml-auto flex items-center gap-2 bg-brand hover:bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Download report
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['Total', stats.total],
          ['Pending', stats.pending],
          ['In Progress', stats.in_progress],
          ['Resolved', stats.resolved],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-200 rounded-md p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
            <p className="text-3xl font-medium text-brand">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading report...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-16 text-center">
          <p className="text-sm text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* Areas ranked by number of complaints */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-brand-dark mb-1">Areas with the most complaints</h2>
            <p className="text-xs text-gray-400 mb-3">
              Each area is about 1 km across. Click an area to see its details.
            </p>

            <div className="space-y-2">
              {shownAreas.map((a, i) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => { setSelectedKey(selectedKey === a.key ? null : a.key); setVisible(LIST_STEP) }}
                  className={`w-full text-left bg-white border rounded-md p-4 transition-all ${
                    selectedKey === a.key
                      ? 'border-brand shadow-sm'
                      : 'border-gray-200 hover:border-brand'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-400 w-6 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-brand-dark truncate">{a.name}</p>
                        <p className="text-sm font-medium text-brand shrink-0">{a.total}</p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${(a.total / maxTotal) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {a.pending} pending · {a.in_progress} in progress · {a.resolved} resolved
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {areas.length > AREAS_SHOWN && (
              <button
                type="button"
                onClick={() => setShowAllAreas((s) => !s)}
                className="mt-3 text-xs text-brand font-medium hover:underline"
              >
                {showAllAreas ? 'Show fewer areas' : `Show all ${areas.length} areas`}
              </button>
            )}
          </div>

          {/* Details of the clicked area */}
          {selectedArea && (
            <div className="bg-white border border-brand rounded-md p-5 mb-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Selected area</p>
                  <p className="text-sm font-medium text-brand-dark">{selectedArea.name}</p>
                  {selectedArea.lat != null && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      GPS: {selectedArea.lat.toFixed(5)}, {selectedArea.lon.toFixed(5)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  aria-label="Close area details"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">By issue type</p>
                  <div className="space-y-1.5">
                    {breakdown(selectedArea.items, (c) => issueLabel(c.issue_type)).map(([name, n]) => (
                      <div key={name} className="flex justify-between text-sm text-gray-700">
                        <span>{name}</span>
                        <span className="font-medium">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">By department</p>
                  <div className="space-y-1.5">
                    {breakdown(selectedArea.items, (c) => c.department || 'Not set').map(([name, n]) => (
                      <div key={name} className="flex justify-between text-sm text-gray-700">
                        <span>{name}</span>
                        <span className="font-medium">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complaints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-brand-dark">
                {selectedArea
                  ? `Complaints in ${selectedArea.name} (${listed.length})`
                  : `Complaints (${listed.length})`}
              </h2>
              {selectedArea && (
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  className="text-xs text-brand font-medium hover:underline"
                >
                  Show all
                </button>
              )}
            </div>

            <div className="space-y-3">
              {listed.slice(0, visible).map((c) => {
                const citizen = citizens[c.citizen_id]
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className="bg-white border border-gray-200 rounded-md p-4 flex gap-4 cursor-pointer hover:border-brand hover:shadow-sm transition-all"
                  >
                    {c.image_url && (
                      <img
                        src={c.image_url}
                        alt="Complaint"
                        className="w-16 h-16 object-cover rounded-md shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {c.description || 'No written description'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Reported by {citizen?.full_name || 'Unknown citizen'} · {citizen?.email || '—'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{c.address || 'No location'}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-brand-surface text-brand border border-brand-light">
                          {c.department || 'No department'}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[c.priority] || 'bg-gray-100 text-gray-500'}`}>
                          {c.priority
                            ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1)
                            : 'Under review'}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[c.status] || statusStyles.pending}`}>
                          {statusLabels[c.status] || c.status}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <Calendar size={10} />
                          {new Date(c.created_at + 'Z').toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {visible < listed.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + LIST_STEP)}
                className="w-full mt-3 py-2.5 text-sm text-brand font-medium border border-brand-light bg-brand-surface hover:bg-brand hover:text-white rounded-md transition-colors"
              >
                Load {Math.min(LIST_STEP, listed.length - visible)} more
              </button>
            )}
          </div>
        </>
      )}

      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  )
}