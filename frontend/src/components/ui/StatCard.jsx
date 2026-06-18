export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      {Icon && (
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  )
}
