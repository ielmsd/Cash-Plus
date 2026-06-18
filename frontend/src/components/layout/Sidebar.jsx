import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Send, Receipt, History,
  Bell, ClipboardList, UserCog, LogOut, Banknote, X
} from 'lucide-react'

export default function Sidebar({ open, onClose }) {
  const { user, logout, hasPermission } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, perm: 'view_dashboard' },
    { to: '/customers', label: t('nav.customers'), icon: Users, perm: 'view_customers' },
    { to: '/transfers', label: t('nav.transfers'), icon: Send, perm: 'view_transfers' },
    { to: '/bills', label: t('nav.bill_payments'), icon: Receipt, perm: 'view_bills' },
    { to: '/transactions', label: t('nav.transactions'), icon: History, perm: 'view_transactions' },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell, perm: 'view_notifications' },
    { to: '/activity-logs', label: t('nav.activity_logs'), icon: ClipboardList, perm: 'view_activity_logs' },
    { to: '/users', label: t('nav.user_management'), icon: UserCog, perm: 'manage_users' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const positionClass = isRTL
    ? `fixed top-0 right-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`
    : `fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={positionClass}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Banknote size={18} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">CashFlow</p>
              <p className="text-xs text-slate-400 leading-tight">Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.filter(item => hasPermission(item.perm)).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">{t(`role.${user?.roles?.[0]}`, user?.roles?.[0])}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
