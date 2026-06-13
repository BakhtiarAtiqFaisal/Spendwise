import { ArrowLeft, ChevronDown, GraduationCap, LogOut, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../api'
import { isLoggedIn, logOut } from '../storage'

type DashboardHeaderProps = {
  userName: string
}

function DashboardHeader({ userName }: DashboardHeaderProps) {
  const initial = userName.trim().charAt(0).toUpperCase() || 'S'
  const navigate = useNavigate()
  const userIsLoggedIn = isLoggedIn()

  function handleLogout() {
    clearAccessToken()
    logOut()
    navigate('/login')
  }

  function handleGoBack() {
    navigate(-1)
  }

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
            <GraduationCap size={28} />
          </div>
          <span className="text-2xl font-bold text-slate-950">
            Spend<span className="text-brand-700">Wise</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label="Go back"
          onClick={handleGoBack}
          className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/add-expense"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={20} />
          Add Expense
        </Link>
        <div className="flex items-center gap-3 rounded-full bg-blue-50 px-3 py-2 text-brand-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold">{initial}</div>
          <ChevronDown size={18} />
        </div>
        {userIsLoggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Log out
          </button>
        )}
      </div>
    </header>
  )
}

export default DashboardHeader