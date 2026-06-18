import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', email: '', password: '', password_confirmation: '', phone: '', agency_code: '', status: 'active', role: 'agent' }

export default function Users() {
  const { isAdmin } = useAuth()
  const { t } = useTranslation()
  const [users, setUsers] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/users', { params: { search, page } }),
        api.get('/roles'),
      ])
      setUsers(uRes.data)
      setRoles(rRes.data)
    } catch {}
    setLoading(false)
  }, [search, page])

  useEffect(() => { load() }, [load])

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data })
    setErrors({})
    setForm(data ? { ...data, password: '', password_confirmation: '', role: data.roles?.[0]?.name || 'agent' } : emptyForm)
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})
    try {
      if (modal.type === 'create') {
        await api.post('/users', form)
        toast.success(t('users.created'))
      } else {
        const updateData = { ...form }
        if (!updateData.password) { delete updateData.password; delete updateData.password_confirmation }
        await api.put(`/users/${modal.data.id}`, updateData)
        toast.success(t('users.updated'))
      }
      setModal({ open: false, type: '', data: null })
      load()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || t('common.error'))
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('users.confirm_delete'))) return
    try {
      await api.delete(`/users/${id}`)
      toast.success(t('users.deleted'))
      load()
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
  }

  const columns = [
    { header: t('users.col_user'), render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-bold">
          {r.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{r.name}</p>
          <p className="text-xs text-slate-500">{r.email}</p>
        </div>
      </div>
    )},
    { header: t('users.col_phone'), render: r => r.phone || '—' },
    { header: t('users.col_agency'), render: r => r.agency_code || '—' },
    { header: t('users.col_role'), render: r => (
      <span className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
        <ShieldCheck size={11} /> {r.roles?.[0]?.name ? t(`role.${r.roles[0].name}`, r.roles[0].name) : '—'}
      </span>
    )},
    { header: t('users.col_status'), render: r => <Badge status={r.status} /> },
    { header: t('users.col_created'), render: r => new Date(r.created_at).toLocaleDateString('fr-MA') },
    { header: t('users.col_actions'), render: r => (
      <div className="flex gap-1">
        <button onClick={() => openModal('edit', r)} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"><Edit2 size={15} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
      </div>
    )},
  ]

  if (!isAdmin()) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      {t('users.restricted')}
    </div>
  )

  const formFields = [
    { key: 'name', label: t('users.field_name'), required: true },
    { key: 'email', label: t('users.field_email'), type: 'email', required: true },
    { key: 'password', label: modal.type === 'create' ? t('users.field_password') : t('users.field_new_password'), type: 'password', required: modal.type === 'create' },
    { key: 'password_confirmation', label: t('users.field_confirm'), type: 'password', required: modal.type === 'create' },
    { key: 'phone', label: t('users.field_phone') },
    { key: 'agency_code', label: t('users.field_agency') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('users.title')}</h1>
          <p className="text-slate-500 text-sm">{t('users.subtitle')}</p>
        </div>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> {t('users.new')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t('users.search')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <DataTable columns={columns} data={users?.data} loading={loading} pagination={users} onPageChange={setPage} />

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })}
        title={modal.type === 'create' ? t('users.create_title') : t('users.edit_title')} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formFields.map(({ key, label, type = 'text', required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[key] ? 'border-red-400' : 'border-slate-200'}`} />
              {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key][0]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.field_role')} <span className="text-red-500">*</span></label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {roles.map(r => <option key={r.id} value={r.name} className="capitalize">{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.field_status')}</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="active">{t('users.status_active')}</option>
              <option value="inactive">{t('users.status_inactive')}</option>
              <option value="suspended">{t('users.status_suspended')}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={() => setModal({ open: false })} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? t('common.saving') : t('users.save_btn')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
