import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { calculateCategoryTotal, getLastMonthSpending, getPlannedBudget, getThisMonthSpending, setSetupComplete } from '../storage'

function SetupConfirmationPage() {
  useEffect(() => {
    setSetupComplete()
  }, [])

  const plannedBudget = getPlannedBudget()
  const lastMonth = getLastMonthSpending()
  const thisMonth = getThisMonthSpending()
  const plannedTotal = calculateCategoryTotal(plannedBudget?.categories ?? null)
  const lastMonthTotal = calculateCategoryTotal(lastMonth)
  const thisMonthTotal = calculateCategoryTotal(thisMonth)
  const availableBalance = (plannedBudget?.income ?? 0) - thisMonthTotal

  return (
    <Layout>
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">✓</div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Budget setup completed successfully</h1>
        <p className="mt-3 text-slate-600">Your planned budget, last month spending, and this month spending have been saved. SpendWise is ready to show your dashboard.</p>

        <div className="mt-8 grid gap-3 rounded-2xl bg-blue-50 p-6 text-left text-slate-700">
          <p>Monthly income: <strong>${(plannedBudget?.income ?? 0).toFixed(2)}</strong></p>
          <p>Monthly savings goal: <strong>${(plannedBudget?.savingsGoal ?? 0).toFixed(2)}</strong></p>
          <p>Planned budget total: <strong>${plannedTotal.toFixed(2)}</strong></p>
          <p>Last month spending total: <strong>${lastMonthTotal.toFixed(2)}</strong></p>
          <p>This month spending total: <strong>${thisMonthTotal.toFixed(2)}</strong></p>
          <p>Available balance: <strong>${availableBalance.toFixed(2)}</strong></p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to="/dashboard"><PrimaryButton>Go to Dashboard</PrimaryButton></Link>
          <Link to="/setup/planned-budget"><PrimaryButton className="bg-slate-800 hover:bg-slate-900">Edit Budget Setup</PrimaryButton></Link>
        </div>
      </div>
    </Layout>
  )
}

export default SetupConfirmationPage