import type { LucideIcon } from 'lucide-react'
import type { BudgetCategory } from '../types'

type CategoryRow = {
  key: BudgetCategory
  label: string
  amount: number
  icon: LucideIcon
}

type PlannedCategoriesCardProps = {
  categories: CategoryRow[]
  formatCurrency: (value: number) => string
}

function PlannedCategoriesCard({ categories, formatCurrency }: PlannedCategoriesCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">This Month: Planned Spending Categories</h2>
      <div className="mt-5 divide-y divide-slate-200">
        {categories.map(({ key, label, amount, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
                <Icon size={22} />
              </div>
              <p className="font-medium text-slate-900">{label}</p>
            </div>
            <p className="font-semibold text-slate-950">{formatCurrency(amount)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PlannedCategoriesCard