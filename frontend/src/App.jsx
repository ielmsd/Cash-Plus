import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Transfers from './pages/Transfers'
import BillPayments from './pages/BillPayments'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Notifications from './pages/Notifications'
import ActivityLogs from './pages/ActivityLogs'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="bills" element={<BillPayments />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="users" element={<Users />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
