import { useTranslation } from 'react-i18next'

const variants = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-100 text-purple-700',
}

const statusMap = {
  active: 'success', completed: 'success', paid: 'success',
  pending: 'warning',
  inactive: 'default', cancelled: 'default',
  blocked: 'error', failed: 'error', suspended: 'error',
  send: 'info', receive: 'purple',
  transfer: 'info', bill_payment: 'purple',
  deposit: 'success', withdrawal: 'warning',
}

export default function Badge({ label, variant, status }) {
  const { t } = useTranslation()
  const v = variant || statusMap[status] || 'default'
  const text = label || (status ? t(`status.${status}`, status) : '—')
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[v]}`}>
      {text}
    </span>
  )
}
