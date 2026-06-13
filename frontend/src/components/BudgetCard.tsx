type BudgetCardProps = {
  title: string
  amount: number
  subtitle?: string
}

function BudgetCard({ title, amount, subtitle }: BudgetCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">${amount.toFixed(2)}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}

export default BudgetCard