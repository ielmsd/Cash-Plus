import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../lib/axios'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'

export default function Transactions() {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState({ search: '', type: '', status: '', date_from: '', date_to: '' })
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/transactions', { params: { ...filters, page } })
      setTransactions(res.data)
    } catch {}
    setLoading(false)
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const formatAmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(n)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/transactions', { params: { ...filters, per_page: 10000 } })
      const rows = res.data.data
      const headers = [
        t('transactions.col_reference'), t('transactions.col_type'), t('transactions.col_customer'),
        t('transactions.col_agent'), 'Amount (MAD)', 'Fee (MAD)', t('transactions.col_status'),
        t('transactions.col_description'), t('transactions.col_date'),
      ]
      const csv = [
        headers.join(','),
        ...rows.map(r => [
          r.reference, r.type,
          r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '',
          r.agent?.name || '', r.amount, r.fee, r.status,
          `"${(r.description || '').replace(/"/g, '""')}"`,
          new Date(r.created_at).toLocaleString('fr-MA'),
        ].join(','))
      ].join('\n')

      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    setExporting(false)
  }

  const columns = [
    { header: t('transactions.col_reference'), render: r => <span className="font-mono text-xs text-slate-700">{r.reference}</span> },
    { header: t('transactions.col_type'), render: r => <Badge status={r.type} /> },
    { header: t('transactions.col_customer'), render: r => r.customer
      ? `${r.customer.first_name} ${r.customer.last_name}`
      : <span className="text-slate-400 text-xs">—</span>
    },
    { header: t('transactions.col_agent'), render: r => r.agent?.name || '—' },
    { header: t('transactions.col_amount'), render: r => <span className="font-semibold text-emerald-700">{formatAmt(r.amount)}</span> },
    { header: t('transactions.col_fee'), render: r => <span className="text-sm text-slate-500">{formatAmt(r.fee)}</span> },
    { header: t('transactions.col_status'), render: r => <Badge status={r.status} /> },
    { header: t('transactions.col_description'), render: r => <span className="text-xs text-slate-500 max-w-[180px] truncate block">{r.description}</span> },
    { header: t('transactions.col_date'), render: r => new Date(r.created_at).toLocaleString('fr-MA', { dateStyle: 'short', timeStyle: 'short' }) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('transactions.title')}</h1>
          <p className="text-slate-500 text-sm">{t('transactions.subtitle')}</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <Download size={16} /> {exporting ? t('transactions.exporting') : t('transactions.export')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={t('transactions.search')}
              value={filters.search} onChange={e => setFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filters.type} onChange={e => setFilter('type', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">{t('transactions.all_types')}</option>
            <option value="transfer">{t('transactions.type_transfer')}</option>
            <option value="bill_payment">{t('transactions.type_bill_payment')}</option>
            <option value="deposit">{t('transactions.type_deposit')}</option>
            <option value="withdrawal">{t('transactions.type_withdrawal')}</option>
          </select>
          <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {transactions && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-sm text-emerald-700 font-medium">
            {t('transactions.found', { count: transactions.total })}
            {transactions.data?.length > 0 && t('transactions.found_total', {
              amount: formatAmt(transactions.data.reduce((s, tx) => s + Number(tx.amount), 0))
            })}
          </p>
        </div>
      )}

      <DataTable columns={columns} data={transactions?.data} loading={loading} pagination={transactions} onPageChange={setPage} />
    </div>
  )
}
