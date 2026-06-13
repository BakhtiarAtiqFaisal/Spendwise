import type { LucideIcon } from 'lucide-react'
import type { Expense } from '../types'

type RecentExpensesCardProps = {
  expenses: Expense[]
  getIcon: (category: string) => LucideIcon
  formatCurrency: (value: number) => string
}

function RecentExpensesCard({ expenses, getIcon, formatCurrency }: RecentExpensesCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Recent Expenses</h2>
      {expenses.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">No expenses added yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-200">
          {expenses.map((expense) => {
            const Icon = getIcon(expense.category)
            return (
              <div key={expense.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
                    <Icon size={23} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">{expense.title}</p>
                    <p className="text-sm capitalize text-slate-500">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <p className="shrink-0 font-bold text-slate-950">{formatCurrency(expense.amount)}</p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default RecentExpensesCard