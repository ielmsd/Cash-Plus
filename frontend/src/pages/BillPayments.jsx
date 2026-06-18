import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'

const BILL_TYPE_KEYS = ['electricity', 'water', 'internet', 'phone', 'tax', 'insurance', 'other']
const PROVIDERS = {
  electricity: ['ONEE', 'Redal', 'Lydec'],
  water: ['ONEE', 'RADEEMA', 'RAK'],
  internet: ['Maroc Telecom', 'Orange', 'inwi'],
  phone: ['Maroc Telecom', 'Orange', 'inwi'],
  tax: ['DGI', 'TGR'],
  insurance: ['Wafa Assurance', 'RMA', 'AXA'],
  other: ['Other'],
}

const emptyForm = { customer_id: '', bill_type: '', provider: '', account_number: '', amount: '', fee: '', period: '', notes: '' }

export default function BillPayments() {
  const { t } = useTranslation()
  const [bills, setBills] = useState(null)
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/bill-payments', { params: { search, bill_type: typeFilter, page } }),
        api.get('/bill-payments/stats'),
      ])
      setBills(bRes.data)
      setStats(sRes.data)
    } catch {}
    setLoading(false)
  }, [search, typeFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get('/customers', { params: { per_page: 100 } }).then(r => setCustomers(r.data.data || [])).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrors({})
    try {
      await api.post('/bill-payments', form)
      toast.success(t('bills.created'))
      setModal(false)
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
    { header: t('bills.col_reference'), render: r => <span className="font-mono text-xs">{r.reference}</span> },
    { header: t('bills.col_customer'), render: r => <span className="text-sm font-medium">{r.customer?.first_name} {r.customer?.last_name}</span> },
    { header: t('bills.col_bill_type'), render: r => <span className="text-sm">{t(`bill_type.${r.bill_type}`, r.bill_type)}</span> },
    { header: t('bills.col_provider'), key: 'provider' },
    { header: t('bills.col_account'), key: 'account_number' },
    { header: t('bills.col_amount'), render: r => <span className="font-semibold text-emerald-700">{formatAmt(r.amount)}</span> },
    { header: t('bills.col_status'), render: r => <Badge status={r.status} /> },
    { header: t('bills.col_date'), render: r => new Date(r.created_at).toLocaleDateString('fr-MA') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('bills.title')}</h1>
          <p className="text-slate-500 text-sm">{t('bills.subtitle')}</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> {t('bills.new')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title={t('bills.stat_total')} value={stats.total} icon={Receipt} color="blue" />
          <StatCard title={t('bills.stat_today')} value={stats.today} icon={Receipt} color="emerald" />
          <StatCard title={t('bills.stat_month')} value={stats.this_month} icon={Receipt} color="purple" />
          <StatCard title={t('bills.stat_amount')} value={formatAmt(stats.total_amount)} icon={Receipt} color="orange" />
        </div>
      )}

      {stats?.by_type && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.by_type.map(b => (
            <div key={b.bill_type} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 capitalize mb-1">{t(`bills.type_${b.bill_type}`, b.bill_type)}</p>
              <p className="text-lg font-bold text-slate-800">{b.count}</p>
              <p className="text-xs text-emerald-600 font-medium">{formatAmt(b.total)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t('bills.search')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">{t('bills.all_types')}</option>
          {BILL_TYPE_KEYS.map(tp => <option key={tp} value={tp}>{t(`bills.type_${tp}`)}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={bills?.data} loading={loading} pagination={bills} onPageChange={setPage} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={t('bills.modal_title')} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bills.field_customer')} <span className="text-red-500">*</span></label>
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('bills.select_customer')}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.cin}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bills.field_type')} <span className="text-red-500">*</span></label>
            <select value={form.bill_type} onChange={e => setForm(f => ({ ...f, bill_type: e.target.value, provider: '' }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('bills.select_type')}</option>
              {BILL_TYPE_KEYS.map(tp => <option key={tp} value={tp}>{t(`bills.type_${tp}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bills.field_provider')} <span className="text-red-500">*</span></label>
            <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('bills.select_provider')}</option>
              {(PROVIDERS[form.bill_type] || []).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {[
            { key: 'account_number', label: t('bills.field_account'), required: true },
            { key: 'amount', label: t('bills.field_amount'), type: 'number', required: true },
            { key: 'fee', label: t('bills.field_fee'), type: 'number' },
            { key: 'period', label: t('bills.field_period') },
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
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bills.field_notes')}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? t('common.processing') : t('bills.process_btn')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
