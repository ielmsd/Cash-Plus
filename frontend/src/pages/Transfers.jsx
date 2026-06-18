import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Send, ArrowDownLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'

const emptyForm = {
  sender_id: '', recipient_name: '', recipient_phone: '',
  recipient_city: '', amount: '', fee: '', type: 'send', notes: '',
}

export default function Transfers() {
  const { t } = useTranslation()
  const [transfers, setTransfers] = useState(null)
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false })
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        api.get('/transfers', { params: { search, status: statusFilter, type: typeFilter, page } }),
        api.get('/transfers/stats'),
      ])
      setTransfers(tRes.data)
      setStats(sRes.data)
    } catch {}
    setLoading(false)
  }, [search, statusFilter, typeFilter, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/customers', { params: { per_page: 100 } })
      .then(r => setCustomers(r.data.data || []))
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors({})
    try {
      await api.post('/transfers', form)
      toast.success(t('transfers.created'))
      setModal({ open: false })
      setForm(emptyForm)
      load()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || t('common.error'))
    }
    setSaving(false)
  }

  const formatAmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(n)

  const columns = [
    { header: t('transfers.col_reference'), render: r => <span className="font-mono text-xs text-slate-700">{r.reference}</span> },
    { header: t('transfers.col_sender'), render: r => (
      <div>
        <p className="font-medium text-sm">{r.sender?.first_name} {r.sender?.last_name}</p>
        <p className="text-xs text-slate-500">{r.sender?.cin}</p>
      </div>
    )},
    { header: t('transfers.col_recipient'), render: r => (
      <div>
        <p className="text-sm">{r.recipient_name}</p>
        <p className="text-xs text-slate-500">{r.recipient_phone}</p>
      </div>
    )},
    { header: t('transfers.col_amount'), render: r => <span className="font-semibold text-emerald-700">{formatAmt(r.amount)}</span> },
    { header: t('transfers.col_fee'), render: r => <span className="text-sm text-slate-600">{formatAmt(r.fee)}</span> },
    { header: t('transfers.col_type'), render: r => <Badge status={r.type} /> },
    { header: t('transfers.col_status'), render: r => <Badge status={r.status} /> },
    { header: t('transfers.col_date'), render: r => new Date(r.created_at).toLocaleDateString('fr-MA') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('transfers.title')}</h1>
          <p className="text-slate-500 text-sm">{t('transfers.subtitle')}</p>
        </div>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> {t('transfers.new')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title={t('transfers.stat_total')} value={stats.total} icon={Send} color="blue" />
          <StatCard title={t('transfers.stat_today')} value={stats.today} icon={Send} color="emerald" />
          <StatCard title={t('transfers.stat_month')} value={stats.this_month} icon={Send} color="purple" />
          <StatCard title={t('transfers.stat_amount')} value={formatAmt(stats.total_amount)} icon={Send} color="orange" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t('transfers.search')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">{t('transfers.all_status')}</option>
          <option value="pending">{t('transfers.status_pending')}</option>
          <option value="completed">{t('transfers.status_completed')}</option>
          <option value="cancelled">{t('transfers.status_cancelled')}</option>
          <option value="failed">{t('transfers.status_failed')}</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">{t('transfers.all_types')}</option>
          <option value="send">{t('transfers.send')}</option>
          <option value="receive">{t('transfers.receive')}</option>
        </select>
      </div>

      <DataTable columns={columns} data={transfers?.data} loading={loading} pagination={transfers} onPageChange={setPage} />

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={t('transfers.modal_title')} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('transfers.field_type')}</label>
            <div className="flex gap-3">
              {['send', 'receive'].map(tp => (
                <button key={tp} type="button" onClick={() => setForm(f => ({ ...f, type: tp }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${form.type === tp ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {tp === 'send' ? <><Send size={14} className="inline mr-1" />{t('transfers.send')}</> : <><ArrowDownLeft size={14} className="inline mr-1" />{t('transfers.receive')}</>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('transfers.field_customer')} <span className="text-red-500">*</span></label>
            <select value={form.sender_id} onChange={e => setForm(f => ({ ...f, sender_id: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.sender_id ? 'border-red-400' : 'border-slate-200'}`}>
              <option value="">{t('transfers.select_customer')}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.cin}</option>
              ))}
            </select>
            {errors.sender_id && <p className="text-xs text-red-500 mt-1">{errors.sender_id[0]}</p>}
          </div>

          {[
            { key: 'recipient_name', label: t('transfers.field_recipient_name'), required: true },
            { key: 'recipient_phone', label: t('transfers.field_recipient_phone'), required: true },
            { key: 'recipient_city', label: t('transfers.field_recipient_city') },
            { key: 'amount', label: t('transfers.field_amount'), type: 'number', required: true },
            { key: 'fee', label: t('transfers.field_fee'), type: 'number' },
          ].map(({ key, label, type = 'text', required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[key] ? 'border-red-400' : 'border-slate-200'}`} />
              {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key][0]}</p>}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('transfers.field_notes')}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal({ open: false })}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? t('common.processing') : t('transfers.create_btn')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
