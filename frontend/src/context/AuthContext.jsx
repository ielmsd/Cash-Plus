import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role)
  const hasPermission = (perm) => user?.permissions?.includes(perm)
  const isAdmin = () => hasRole('admin')

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
