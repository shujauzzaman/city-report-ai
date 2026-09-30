import { useEffect, useState, useRef } from 'react'
import { MapPin, Calendar, Clock, Building2, AlertTriangle, Activity, Cpu } from 'lucide-react'

const priorityStyles = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const statusStyles = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
}

const hazardStyles = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-blue-100 text-blue-700',
  Low: 'bg-green-100 text-green-700',
}

const issueTypeLabels = {
  pothole: 'Pothole',
  garbage: 'Garbage / Waste',
  open_manhole: 'Open Manhole',
  accident: 'Accident',
  road_damage: 'Road Damage',
  unknown: 'Not Identified',
}

export default function ComplaintModal({ complaint, onClose, actions }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const hasDetection = complaint.issue_type && complaint.issue_type !== 'unknown'

  const [imgSize, setImgSize] = useState(null)
  const imgRef = useRef(null)

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgSize({
        displayedWidth: imgRef.current.clientWidth,
        displayedHeight: imgRef.current.clientHeight,
        naturalWidth: imgRef.current.naturalWidth,
        naturalHeight: imgRef.current.naturalHeight,
      })
    }
  }

  const hasBox = complaint.box_x1 != null && complaint.box_y1 != null && complaint.box_x2 != null && complaint.box_y2 != null

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* Image */}
        {complaint.image_url && (
          <div className="relative w-full h-56 rounded-t-md overflow-hidden">
            <img
              ref={imgRef}
              src={complaint.image_url}
              alt="Complaint"
              onLoad={handleImageLoad}
              className="w-full h-56 object-cover"
            />
            {hasBox && imgSize && (() => {
              // object-cover crops the image to fill the box, so we scale using the
              // larger of the two ratios (matching object-cover's crop behavior)
              const scale = Math.max(
                imgSize.displayedWidth / imgSize.naturalWidth,
                imgSize.displayedHeight / imgSize.naturalHeight
              )
              const offsetX = (imgSize.naturalWidth * scale - imgSize.displayedWidth) / 2
              const offsetY = (imgSize.naturalHeight * scale - imgSize.displayedHeight) / 2

              const left = complaint.box_x1 * scale - offsetX
              const top = complaint.box_y1 * scale - offsetY
              const width = (complaint.box_x2 - complaint.box_x1) * scale
              const height = (complaint.box_y2 - complaint.box_y1) * scale

              return (
                <div
                  className="absolute border-2 border-brand-accent"
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.6)',
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-brand-accent text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                    {complaint.issue_type} {Math.round((complaint.detection_confidence || 0) * 100)}%
                  </span>
                </div>
              )
            })()}
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-5 space-y-4">

          {/* Badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Priority</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityStyles[complaint.priority] || priorityStyles.medium}`}>
                {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <Activity size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Status</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusStyles[complaint.status] || statusStyles.pending}`}>
                {complaint.status === 'in_progress' ? 'In Progress' : complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
              </span>
            </div>
          </div>

          {/* AI Detection — E3-US5 */}
          {hasDetection && (
            <div className="bg-brand-surface border border-brand-light rounded-md px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Cpu size={13} className="text-brand" />
                <p className="text-xs text-brand font-medium uppercase tracking-wide">AI Detection</p>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <p className="text-sm text-gray-800 font-medium">
                  {issueTypeLabels[complaint.issue_type] || complaint.issue_type}
                </p>
                <div className="flex items-center gap-1.5">
                  {complaint.hazard_level && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${hazardStyles[complaint.hazard_level] || hazardStyles.Medium}`}>
                      {complaint.hazard_level} Hazard
                    </span>
                  )}
                  {complaint.detection_confidence != null && (
                    <span className="text-xs text-gray-400">
                      {Math.round(complaint.detection_confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {complaint.description || 'No description provided.'}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="text-brand mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{complaint.address || 'No location provided.'}</p>
            </div>
            {complaint.latitude && complaint.longitude && (
              <p className="text-xs text-gray-400 mt-1 ml-5">
                GPS: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
              </p>
            )}
          </div>

          {/* Department */}
          {complaint.department && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Department</p>
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="text-brand" />
                <p className="text-sm text-gray-700">{complaint.department}</p>
              </div>
            </div>
          )}

          {/* Date & time */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Submitted</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-brand" />
                <p className="text-sm text-gray-700">
                  {new Date(complaint.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-brand" />
                <p className="text-sm text-gray-700">
                  {new Date(complaint.created_at + 'Z').toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Resolution proof — show if resolved */}
        {complaint.resolution_proof_url && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Resolution Evidence</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 text-center mb-1">Before</p>
                <img
                  src={complaint.image_url}
                  alt="Before"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 text-center mb-1">After</p>
                <img
                  src={complaint.resolution_proof_url}
                  alt="After"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
    </div>
    {complaint.resolution_notes && (
      <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-md px-3 py-2">
        {complaint.resolution_notes}
      </p>
    )}
  </div>
)}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
          {actions && actions}
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-500 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}