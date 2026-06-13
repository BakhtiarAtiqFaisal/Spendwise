import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AddExpensePage from './pages/AddExpensePage'
import BudgetSetupPage from './pages/BudgetSetupPage'
import ConfirmationPage from './pages/ConfirmationPage'
import CreateAccountPage from './pages/CreateAccountPage'
import DashboardPage from './pages/DashboardPage'
import LastMonthSpendingPage from './pages/LastMonthSpendingPage'
import LoginPage from './pages/LoginPage'
import PlannedBudgetSetupPage from './pages/PlannedBudgetSetupPage'
import SetupConfirmationPage from './pages/SetupConfirmationPage'
import ThisMonthSpendingPage from './pages/ThisMonthSpendingPage'
import WelcomePage from './pages/WelcomePage'
import { isLoggedIn } from './storage'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/budget-setup" element={<ProtectedRoute><BudgetSetupPage /></ProtectedRoute>} />
      <Route path="/setup/planned-budget" element={<ProtectedRoute><PlannedBudgetSetupPage /></ProtectedRoute>} />
      <Route path="/setup/last-month" element={<ProtectedRoute><LastMonthSpendingPage /></ProtectedRoute>} />
      <Route path="/setup/this-month" element={<ProtectedRoute><ThisMonthSpendingPage /></ProtectedRoute>} />
      <Route path="/setup/confirmation" element={<ProtectedRoute><SetupConfirmationPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/add-expense" element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />
      <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
