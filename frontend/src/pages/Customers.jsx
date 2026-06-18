import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'
import { Users, UserCheck, UserX } from 'lucide-react'

const emptyForm = {
  first_name: '', last_name: '', cin: '', phone: '',
  email: '', address: '', city: '', date_of_birth: '', gender: '', status: 'active',
}

function CustomerForm({ form, onChange, errors }) {
  const { t } = useTranslation()
  const fields = [
    { key: 'first_name', label: t('customers.field_first_name'), required: true },
    { key: 'last_name', label: t('customers.field_last_name'), required: true },
    { key: 'cin', label: t('customers.field_cin'), required: true },
    { key: 'phone', label: t('customers.field_phone'), required: true },
    { key: 'email', label: t('customers.field_email'), type: 'email' },
    { key: 'city', label: t('customers.field_city') },
    { key: 'date_of_birth', label: t('customers.field_dob'), type: 'date' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ key, label, type = 'text', required }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            value={form[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500
              ${errors?.[key] ? 'border-red-400' : 'border-slate-200'}`}
          />
          {errors?.[key] && <p className="text-xs text-red-500 mt-1">{errors[key][0]}</p>}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.field_gender')}</label>
        <select value={form.gender || ''} onChange={e => onChange('gender', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">{t('customers.select')}</option>
          <option value="male">{t('customers.male')}</option>
          <option value="female">{t('customers.female')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.field_status')}</label>
        <select value={form.status || 'active'} onChange={e => onChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="active">{t('customers.active')}</option>
          <option value="inactive">{t('customers.inactive')}</option>
          <option value="blocked">{t('customers.blocked')}</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers.field_address')}</label>
        <input type="text" value={form.address || ''} onChange={e => onChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>
  )
}

export default function Customers() {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [custRes, statsRes] = await Promise.all([
        api.get('/customers', { params: { search, status: statusFilter, page } }),
        api.get('/customers/stats'),
      ])
      setCustomers(custRes.data)
      setStats(statsRes.data)
    } catch {}
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { load() }, [load])

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data })
    setErrors({})
    setForm(data ? { ...data } : emptyForm)
  }
  const closeModal = () => setModal({ open: false, type: '', data: null })

  const handleSave = async () => {
    setSaving(true)
    setErrors({})
    try {
      if (modal.type === 'create') {
        await api.post('/customers', form)
        toast.success(t('customers.created'))
      } else {
        await api.put(`/customers/${modal.data.id}`, form)
        toast.success(t('customers.updated'))
      }
      closeModal()
      load()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || t('common.error'))
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('customers.confirm_delete'))) return
    try {
      await api.delete(`/customers/${id}`)
      toast.success(t('customers.deleted'))
      load()
    } catch { toast.error(t('common.error')) }
  }

  const columns = [
    { header: t('customers.col_customer'), render: r => (
      <div>
        <p className="font-medium text-slate-800">{r.first_name} {r.last_name}</p>
        <p className="text-xs text-slate-500">{r.cin}</p>
      </div>
    )},
    { header: t('customers.col_phone'), key: 'phone' },
    { header: t('customers.col_city'), render: r => r.city || '—' },
    { header: t('customers.col_agent'), render: r => r.agent?.name || '—' },
    { header: t('customers.col_status'), render: r => <Badge status={r.status} /> },
    { header: t('customers.col_joined'), render: r => new Date(r.created_at).toLocaleDateString('fr-MA') },
    { header: t('customers.col_actions'), render: r => (
      <div className="flex gap-1">
        <button onClick={() => openModal('view', r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-500"><Eye size={15} /></button>
        <button onClick={() => openModal('edit', r)} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"><Edit2 size={15} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
      </div>
    )},
  ]

  const detailFields = [
    ['detail_cin', r => r.cin], ['detail_phone', r => r.phone],
    ['detail_email', r => r.email || '—'], ['detail_city', r => r.city || '—'],
    ['detail_gender', r => r.gender ? t(`gender.${r.gender}`, r.gender) : '—'],
    ['detail_dob', r => r.date_of_birth || '—'],
    ['detail_agent', r => r.agent?.name || '—'],
    ['detail_joined', r => new Date(r.created_at).toLocaleDateString('fr-MA')],
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('customers.title')}</h1>
          <p className="text-slate-500 text-sm">{t('customers.subtitle')}</p>
        </div>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
          <UserPlus size={16} /> {t('customers.new')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title={t('customers.stat_total')} value={stats.total} icon={Users} color="blue" />
          <StatCard title={t('customers.stat_active')} value={stats.active} icon={UserCheck} color="emerald" />
          <StatCard title={t('customers.stat_inactive')} value={stats.inactive} icon={UserX} color="orange" />
          <StatCard title={t('customers.stat_month')} value={stats.this_month} icon={Plus} color="purple" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t('customers.search')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">{t('customers.all_status')}</option>
          <option value="active">{t('customers.active')}</option>
          <option value="inactive">{t('customers.inactive')}</option>
          <option value="blocked">{t('customers.blocked')}</option>
        </select>
      </div>

      <DataTable columns={columns} data={customers?.data} loading={loading} pagination={customers} onPageChange={setPage} />

      <Modal isOpen={modal.open && modal.type !== 'view'} onClose={closeModal}
        title={modal.type === 'create' ? t('customers.add_title') : t('customers.edit_title')} size="lg">
        <CustomerForm form={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} errors={errors} />
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={closeModal} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? t('common.saving') : t('customers.save_btn')}
          </button>
        </div>
      </Modal>

      <Modal isOpen={modal.open && modal.type === 'view'} onClose={closeModal} title={t('customers.view_title')} size="lg">
        {modal.data && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xl font-bold">
                {modal.data.first_name?.[0]}{modal.data.last_name?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{modal.data.first_name} {modal.data.last_name}</h3>
                <Badge status={modal.data.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {detailFields.map(([key, getValue]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{t(`customers.${key}`)}</p>
                  <p className="font-medium text-slate-800">{getValue(modal.data)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
