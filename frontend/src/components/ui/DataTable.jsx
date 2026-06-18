import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function DataTable({ columns, data, loading, pagination, onPageChange }) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-start px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    {t('table.loading')}
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  {t('table.no_data')}
                </td>
              </tr>
            ) : (
              data?.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-slate-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {t('table.showing', { from: pagination.from, to: pagination.to, total: pagination.total })}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.current_page === 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors
                    ${pagination.current_page === page
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-100 text-slate-600'
                    }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => onPageChange(pagination.current_page + 1)}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
