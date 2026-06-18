import { useState, useEffect, useCallback } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import { useAuth } from '../context/AuthContext'

const actionColors = {
  login: 'bg-blue-50 text-blue-700',
  logout: 'bg-slate-100 text-slate-600',
  create_customer: 'bg-emerald-50 text-emerald-700',
  update_customer: 'bg-amber-50 text-amber-700',
  delete_customer: 'bg-red-50 text-red-700',
  create_transfer: 'bg-emerald-50 text-emerald-700',
  create_bill_payment: 'bg-purple-50 text-purple-700',
  create_user: 'bg-blue-50 text-blue-700',
}

export default function ActivityLogs() {
  const { isAdmin } = useAuth()
  const { t } = useTranslation()
  const [logs, setLogs] = useState(null)
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', action: '', date_from: '', date_to: '' })
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [lRes, aRes] = await Promise.all([
        api.get('/activity-logs', { params: { ...filters, page } }),
        api.get('/activity-logs/actions'),
      ])
      setLogs(lRes.data)
      setActions(aRes.data)
    } catch {}
    setLoading(false)
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }

  const columns = [
    { header: t('logs.col_time'), render: r => (
      <div>
        <p className="text-xs font-medium">{new Date(r.created_at).toLocaleTimeString('fr-MA', { timeStyle: 'short' })}</p>
        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('fr-MA')}</p>
      </div>
    )},
    { header: t('logs.col_user'), render: r => (
      <div>
        <p className="text-sm font-medium">{r.user?.name || '—'}</p>
        <p className="text-xs text-slate-500">{r.user?.email}</p>
      </div>
    )},
    { header: t('logs.col_action'), render: r => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[r.action] || 'bg-slate-50 text-slate-700'}`}>
        {t(`action.${r.action}`, r.action?.replace(/_/g, ' '))}
      </span>
    )},
    { header: t('logs.col_description'), render: r => <span className="text-xs text-slate-600">{r.description}</span> },
    { header: t('logs.col_ip'), render: r => <span className="font-mono text-xs text-slate-500">{r.ip_address}</span> },
    { header: t('logs.col_model'), render: r => r.model_type
      ? <span className="text-xs text-slate-500">{r.model_type?.split('\\').pop()} #{r.model_id}</span>
      : <span className="text-slate-300 text-xs">—</span>
    },
  ]

  if (!isAdmin()) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      {t('logs.restricted')}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList size={24} className="text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('logs.title')}</h1>
          <p className="text-slate-500 text-sm">{t('logs.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={t('logs.search')}
              value={filters.search} onChange={e => setFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filters.action} onChange={e => setFilter('action', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">{t('logs.all_actions')}</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <DataTable columns={columns} data={logs?.data} loading={loading} pagination={logs} onPageChange={setPage} />
    </div>
  )
}
