import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ComparisonItem = {
  key: string
  label: string
  percentage: number
  icon: LucideIcon
}

type LastMonthComparisonCardProps = {
  items: ComparisonItem[]
}

function LastMonthComparisonCard({ items }: LastMonthComparisonCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Compared with Last Month</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(({ key, label, percentage, icon: Icon }) => {
          const isLower = percentage < 0
          const isHigher = percentage > 0
          const ArrowIcon = isLower ? ArrowDown : isHigher ? ArrowUp : ArrowRight
          const colorClass = isLower ? 'text-green-600' : isHigher ? 'text-red-600' : 'text-slate-500'

          return (
            <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
                  <Icon size={21} />
                </div>
                <p className="font-medium text-slate-900">{label}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`inline-flex items-center gap-1 text-lg font-bold ${colorClass}`}>
                  <ArrowIcon size={19} /> {Math.abs(percentage)}%
                </span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default LastMonthComparisonCard