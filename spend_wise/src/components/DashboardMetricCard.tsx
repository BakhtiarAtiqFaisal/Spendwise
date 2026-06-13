import type { LucideIcon } from 'lucide-react'

type DashboardMetricCardProps = {
  title: string
  value: string
  icon: LucideIcon
}

function DashboardMetricCard({ title, value, icon: Icon }: DashboardMetricCardProps) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-600">
        <Icon size={30} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-700">{value}</p>
      </div>
    </div>
  )
}

export default DashboardMetricCard