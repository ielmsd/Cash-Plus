import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden sidebar-offset">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
