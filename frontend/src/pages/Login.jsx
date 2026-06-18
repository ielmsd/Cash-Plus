import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Banknote, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
]

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@cashflow.ma', password: 'password' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success(t('login.welcome_back'))
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center gap-2 mb-6">
          {LANGS.map(({ code, label }) => (
            <button key={code} onClick={() => i18n.changeLanguage(code)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                i18n.language === code ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg">
            <Banknote size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CashFlow Manager</h1>
          <p className="text-slate-400 mt-2">{t('login.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">{t('login.sign_in')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('login.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="you@cashflow.ma"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 mb-2">{t('login.demo_accounts')}</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><span className="font-medium">Admin:</span> admin@cashflow.ma / password</p>
              <p><span className="font-medium">Agent:</span> agent1@cashflow.ma / password</p>
              <p><span className="font-medium">Employee:</span> employee@cashflow.ma / password</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">{t('login.footer')}</p>
      </div>
    </div>
  )
}
