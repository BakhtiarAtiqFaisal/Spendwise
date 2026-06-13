import { BarChart3, GraduationCap, PiggyBank, PlusCircle, Target, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewMetrics = [
  { label: 'Monthly Income', value: '$2,500' },
  { label: 'Planned Budget', value: '$1,800' },
  { label: 'This Month’s Spending', value: '$120' },
  { label: 'Remaining Balance', value: '$2,380' },
]

const previewCategories = [
  { label: 'Rent', value: '$900' },
  { label: 'Groceries', value: '$400' },
  { label: 'Transport', value: '$250' },
  { label: 'Bills', value: '$150' },
  { label: 'Other', value: '$100' },
]

const features = [
  {
    title: 'Plan your budget',
    text: 'Set income, savings goals, and planned spending categories.',
    icon: Target,
  },
  {
    title: 'Track expenses',
    text: 'Record this month’s spending and see where your money goes.',
    icon: PlusCircle,
  },
  {
    title: 'Save smarter',
    text: 'Compare spending with last month and get simple saving suggestions.',
    icon: PiggyBank,
  },
]

function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Spend<span className="text-blue-700">Wise</span>
          </span>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/login"
            className="rounded-xl px-5 py-3 text-center font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Login
          </Link>
          <Link
            to="/create-account"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Create Account
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-14 lg:grid-cols-[1fr_0.95fr] lg:py-20">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            Student Budget Planner
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
            Take control of your student budget
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Plan your monthly spending, track expenses, and see how much you have left — all in one simple place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/create-account"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <WalletCards className="h-4 w-4 text-blue-600" />
            Simple budgeting for students
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-2xl shadow-blue-100 ring-1 ring-slate-200 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Dashboard Preview</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Hi, Student 👋</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {previewMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-xl font-extrabold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-950">This Month: Planned Spending Categories</h3>
            <div className="mt-4 space-y-3">
              {previewCategories.map((category) => (
                <div key={category.label} className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                  <span className="font-semibold text-slate-700">{category.label}</span>
                  <span className="font-bold text-blue-700">{category.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 pb-14 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default WelcomePage