import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, Trash2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'

const typeColors = {
  info: 'bg-blue-50 border-blue-100 text-blue-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  error: 'bg-red-50 border-red-100 text-red-700',
}

export default function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page }
      if (filter !== '') params.is_read = filter
      const res = await api.get('/notifications', { params })
      setNotifications(res.data)
    } catch {}
    setLoading(false)
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    load()
  }

  const markAllRead = async () => {
    await api.post('/notifications/mark-all-read')
    toast.success(t('notifications.all_marked'))
    load()
  }

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`)
    toast.success(t('notifications.deleted'))
    load()
  }

  const filters = [
    { val: '', label: t('notifications.filter_all') },
    { val: 'false', label: t('notifications.filter_unread') },
    { val: 'true', label: t('notifications.filter_read') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('notifications.title')}</h1>
          <p className="text-slate-500 text-sm">{t('notifications.subtitle')}</p>
        </div>
        <button onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700">
          <CheckCheck size={16} /> {t('notifications.mark_all')}
        </button>
      </div>

      <div className="flex gap-2">
        {filters.map(({ val, label }) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === val ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications?.data?.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">{t('notifications.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications?.data?.map(n => (
            <div key={n.id} className={`relative bg-white rounded-xl border p-4 flex gap-4 items-start shadow-sm
              ${!n.is_read ? 'border-l-4 border-l-emerald-500' : 'border-slate-200'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.is_read ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[n.type] || typeColors.info}`}>
                    {n.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(n.created_at).toLocaleString('fr-MA', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} title={t('notifications.filter_read')}
                    className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600">
                    <Check size={15} />
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} title={t('common.delete')}
                  className="p-1.5 rounded hover:bg-red-50 text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications?.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors
                ${page === p ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
