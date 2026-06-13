import { AlertTriangle, CheckCircle2 } from 'lucide-react'

type BudgetStatusBannerProps = {
  isWithinBudget: boolean
}

function BudgetStatusBanner({ isWithinBudget }: BudgetStatusBannerProps) {
  const Icon = isWithinBudget ? CheckCircle2 : AlertTriangle
  const message = isWithinBudget
    ? 'You are within budget — Great job staying on track!'
    : 'You are over budget — Review your spending categories.'

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-5 font-semibold ${
        isWithinBudget ? 'border-green-200 bg-green-50 text-green-800' : 'border-orange-200 bg-orange-50 text-orange-800'
      }`}
    >
      <Icon size={30} />
      <p>{message}</p>
    </div>
  )
}

export default BudgetStatusBanner