import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import api from '../../lib/axios'

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
]

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(r => setUnreadCount(r.data.count))
      .catch(() => {})
    const interval = setInterval(() => {
      api.get('/notifications/unread-count')
        .then(r => setUnreadCount(r.data.count))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const changeLang = (code) => {
    i18n.changeLanguage(code)
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center px-4 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => changeLang(code)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              i18n.language === code
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Link
        to="/notifications"
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{t(`role.${user?.roles?.[0]}`, user?.roles?.[0])}</p>
        </div>
      </div>
    </header>
  )
}
