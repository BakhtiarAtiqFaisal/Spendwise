import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { calculateCategoryTotal, getLatestExpense, getPlannedBudget, getThisMonthSpending } from '../storage'

function ConfirmationPage() {
  const latestExpense = getLatestExpense()
  const plannedBudget = getPlannedBudget()
  const thisMonthSpending = getThisMonthSpending()
  const totalSpent = calculateCategoryTotal(thisMonthSpending)
  const remainingBalance = (plannedBudget?.income ?? 0) - totalSpent

  return (
    <Layout>
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Expense added successfully</h1>
        <p className="mt-3 text-slate-600">Your SpendWise budget has been updated.</p>

        <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Latest expense</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{latestExpense?.title ?? 'No expense found'}</p>
          <p className="mt-1 text-slate-600">Expense amount: ${latestExpense?.amount.toFixed(2) ?? '0.00'}</p>
          <p className="mt-1 text-slate-600">Updated remaining balance: ${remainingBalance.toFixed(2)}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to="/dashboard">
            <PrimaryButton>Return to Dashboard</PrimaryButton>
          </Link>
          <Link to="/add-expense">
            <PrimaryButton className="bg-slate-800 hover:bg-slate-900">Add Another Expense</PrimaryButton>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default ConfirmationPage