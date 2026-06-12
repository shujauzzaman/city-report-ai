import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Bell } from 'lucide-react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [open, setOpen]                   = useState(false)
  const [userId, setUserId]               = useState(null)
  const panelRef                          = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, message, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        // Only process if it belongs to this user
        if (payload.new.user_id !== userId) return
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    )
    .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unreadIds.length) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleOpen = () => {
    setOpen(prev => !prev)
    if (!open) markAllRead()
  }

  return (
    <div
      ref={panelRef}
      className="relative z-40"
    >
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center shadow-sm hover:border-brand transition-all"
      >
        <Bell size={17} className={unreadCount > 0 ? 'text-brand' : 'text-gray-400'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-xs font-medium rounded-md flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute top-12 right-0 w-72 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-brand-dark">Notifications</p>
            {notifications.some(n => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 ${n.is_read ? 'bg-white' : 'bg-brand-surface'}`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}