import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Users, Send, Receipt, TrendingUp, Banknote, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import api from '../lib/axios'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard', { params: { period } })
      setData(res.data)
    } catch {}
    setLoading(false)
  }, [period])

  useEffect(() => { loadData() }, [loadData])

  const chartData = data?.monthly_trend
    ? Object.entries(
        data.monthly_trend.reduce((acc, item) => {
          const key = monthNames[item.month - 1]
          if (!acc[key]) acc[key] = { month: key, transfer: 0, bill_payment: 0 }
          acc[key][item.type] = (acc[key][item.type] || 0) + Number(item.total)
          return acc
        }, {})
      ).map(([, v]) => v)
    : []

  const billData = data?.bill_types?.map(b => ({
    name: b.bill_type.charAt(0).toUpperCase() + b.bill_type.slice(1),
    value: b.count,
  })) || []

  const formatAmount = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(n)

  const periodLabels = {
    today: t('dashboard.today'),
    week: t('dashboard.week'),
    month: t('dashboard.month'),
    year: t('dashboard.year'),
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const k = data?.kpis || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>
          <p className="text-slate-500 text-sm">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${period === p ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title={t('dashboard.total_customers')} value={k.total_customers?.toLocaleString()} subtitle={`+${k.new_customers} ${t('dashboard.this_period', { period: periodLabels[period] })}`} icon={Users} color="blue" />
        <StatCard title={t('dashboard.transfers')} value={k.transfers_period?.toLocaleString()} subtitle={formatAmount(k.transfer_amount_period)} icon={Send} color="emerald" />
        <StatCard title={t('dashboard.bill_payments')} value={k.bills_period?.toLocaleString()} subtitle={formatAmount(k.bill_amount_period)} icon={Receipt} color="purple" />
        <StatCard title={t('dashboard.revenue')} value={formatAmount(k.total_revenue)} subtitle={t('dashboard.this_period', { period: periodLabels[period] })} icon={TrendingUp} color="orange" />
        <StatCard title={t('dashboard.active_agents')} value={k.active_agents?.toLocaleString()} icon={UserCheck} color="slate" />
        <StatCard title={t('dashboard.total_transfers')} value={k.total_transfers?.toLocaleString()} subtitle={t('dashboard.all_time')} icon={Banknote} color="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">{t('dashboard.monthly_trend')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="trf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatAmount(v)} />
              <Legend />
              <Area type="monotone" dataKey="transfer" name={t('dashboard.transfers_label')} stroke="#10b981" fill="url(#trf)" strokeWidth={2} />
              <Area type="monotone" dataKey="bill_payment" name={t('dashboard.bills_label')} stroke="#8b5cf6" fill="url(#bill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">{t('dashboard.bills_by_type')}</h3>
          {billData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={billData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name">
                  {billData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">{t('dashboard.no_data')}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">{t('dashboard.recent_transactions')}</h3>
          <div className="space-y-3">
            {data?.recent_transactions?.length ? data.recent_transactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{txn.reference}</p>
                  <p className="text-xs text-slate-500">{txn.customer?.first_name} {txn.customer?.last_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{formatAmount(txn.amount)}</p>
                  <Badge status={txn.type} />
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-8">{t('dashboard.no_transactions')}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">{t('dashboard.top_agents')}</h3>
          <div className="space-y-3">
            {data?.top_agents?.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.agency_code}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">{t('dashboard.n_transfers', { count: agent.transfer_count })}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
