import {
  Bus,
  ClipboardList,
  CreditCard,
  Edit3,
  FileText,
  HeartPulse,
  Home,
  MoreHorizontal,
  ReceiptText,
  School,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Utensils,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import BudgetStatusBanner from '../components/BudgetStatusBanner'
import DashboardHeader from '../components/DashboardHeader'
import DashboardMetricCard from '../components/DashboardMetricCard'
import LastMonthComparisonCard from '../components/LastMonthComparisonCard'
import type { ComparisonItem } from '../components/LastMonthComparisonCard'
import PlannedCategoriesCard from '../components/PlannedCategoriesCard'
import PrimaryButton from '../components/PrimaryButton'
import RecentExpensesCard from '../components/RecentExpensesCard'
import RecommendationCard from '../components/RecommendationCard'
import {
  calculateCategoryTotal,
  categoryOptions,
  emptyCategorySpending,
  getExpenses,
  getLastMonthSpending,
  getPlannedBudget,
  getThisMonthSpending,
  getUser,
  isSetupComplete,
} from '../storage'
import type { BudgetCategory, CategorySpending } from '../types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 2,
  }).format(value)

const categoryIcons: Record<BudgetCategory, LucideIcon> = {
  rent: Home,
  groceries: ShoppingCart,
  transport: Bus,
  bills: FileText,
  entertainment: Smile,
  insurance: ShieldCheck,
  education: School,
  health: HeartPulse,
  eatingOut: Utensils,
  other: MoreHorizontal,
}

type ComparisonWithNote = ComparisonItem & { note?: string }

function getCategoryIcon(category: string): LucideIcon {
  return category in categoryIcons ? categoryIcons[category as BudgetCategory] : ReceiptText
}

function getComparisonItems(lastMonth: CategorySpending, thisMonth: CategorySpending): ComparisonWithNote[] {
  return categoryOptions.map((category) => {
    const previous = lastMonth[category.key]
    const current = thisMonth[category.key]
    const percentage = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100)

    return {
      key: category.key,
      label: category.label,
      percentage,
      icon: categoryIcons[category.key],
      note: previous === 0 ? 'No last month data' : undefined,
    }
  })
}

function getRecommendation(
  comparisonItems: ComparisonWithNote[],
  actualSpending: number,
  plannedBudget: number,
  availableBalance: number,
  savingsGoal: number,
) {
  if (actualSpending > plannedBudget) {
    return 'You are spending more than your planned budget. Review your categories and reduce non-essential expenses.'
  }

  const flexibleIncreased = comparisonItems.some(
    (item) => ['entertainment', 'eatingOut', 'transport'].includes(item.key) && item.percentage > 0,
  )
  if (flexibleIncreased) {
    return 'Your flexible spending has increased. Try reducing entertainment, eating out, or transport costs to save more.'
  }

  const lowerCount = comparisonItems.filter((item) => item.percentage < 0).length
  if (lowerCount >= comparisonItems.length / 2) {
    return 'Great job. You are spending less in several categories compared with last month.'
  }

  if (availableBalance >= savingsGoal && savingsGoal > 0) {
    return 'You are on track to meet your savings goal this month.'
  }

  return 'Keep tracking your spending and look for small ways to reduce flexible expenses this month.'
}

function DashboardPage() {
  const user = getUser()
  const userName = user?.name.trim() ?? ''
  const greeting = userName ? `Hi, ${userName} 👋` : 'Hi there 👋'

  if (!isSetupComplete()) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <DashboardHeader userName={userName} />
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-slate-950">Complete your budget setup to view your dashboard.</h1>
            <p className="mt-3 text-slate-600">
              SpendWise needs your planned budget, last month spending, and this month spending before showing results.
            </p>
            <Link to="/setup/planned-budget" className="mx-auto mt-8 block max-w-sm">
              <PrimaryButton>Start Budget Setup</PrimaryButton>
            </Link>
          </section>
        </div>
      </main>
    )
  }

  const plannedBudget = getPlannedBudget()
  const lastMonth = getLastMonthSpending() ?? { ...emptyCategorySpending }
  const thisMonth = getThisMonthSpending() ?? { ...emptyCategorySpending }
  const expenses = getExpenses()
  const monthlyIncome = plannedBudget?.income ?? 0
  const plannedTotal = calculateCategoryTotal(plannedBudget?.categories ?? null)
  const thisMonthsSpending = calculateCategoryTotal(thisMonth)
  const remainingBalance = monthlyIncome - thisMonthsSpending
  const recentExpenses = [...expenses].reverse().slice(0, 5)

  const plannedCategories = categoryOptions.map((category) => ({
    key: category.key,
    label: category.label,
    icon: categoryIcons[category.key],
    amount: plannedBudget?.categories[category.key] ?? 0,
  }))

  const comparisonItems = getComparisonItems(lastMonth, thisMonth)
  const recommendation = getRecommendation(
    comparisonItems,
    thisMonthsSpending,
    plannedTotal,
    remainingBalance,
    plannedBudget?.savingsGoal ?? 0,
  )

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader userName={userName} />

        <section className="mt-1 rounded-b-3xl border border-t-0 border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">{greeting}</h1>
            <p className="mt-2 text-lg text-slate-500">Here’s your budget overview for this month.</p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard title="Monthly Income" value={formatCurrency(monthlyIncome)} icon={CreditCard} />
            <DashboardMetricCard title="Planned Budget" value={formatCurrency(plannedTotal)} icon={ClipboardList} />
            <DashboardMetricCard title="This Month’s Spending" value={formatCurrency(thisMonthsSpending)} icon={ShoppingCart} />
            <DashboardMetricCard title="Remaining Balance" value={formatCurrency(remainingBalance)} icon={Wallet} />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1fr]">
            <div className="space-y-3">
              <div className="flex justify-end">
                <Link
                  to="/setup/planned-budget"
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <Edit3 size={16} />
                  Edit Budget Setup
                </Link>
              </div>
              <PlannedCategoriesCard categories={plannedCategories} formatCurrency={formatCurrency} />
            </div>
            <RecentExpensesCard expenses={recentExpenses} getIcon={getCategoryIcon} formatCurrency={formatCurrency} />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
            <LastMonthComparisonCard items={comparisonItems} />
            <RecommendationCard text={recommendation} />
          </div>

          <div className="mt-6">
            <BudgetStatusBanner isWithinBudget={thisMonthsSpending <= monthlyIncome} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage