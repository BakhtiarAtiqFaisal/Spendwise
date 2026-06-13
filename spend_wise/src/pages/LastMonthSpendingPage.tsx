import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { calculateCategoryTotal, categoryOptions, emptyCategorySpending, getLastMonthSpending, saveLastMonthSpending } from '../storage'
import type { BudgetCategory, CategorySpending } from '../types'

function LastMonthSpendingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<BudgetCategory, string>>(() => {
    const savedSpending = getLastMonthSpending()
    return Object.fromEntries(
      categoryOptions.map((category) => [category.key, savedSpending ? String(savedSpending[category.key] ?? '') : '']),
    ) as Record<BudgetCategory, string>
  })
  const [submitted, setSubmitted] = useState(false)
  const spending: CategorySpending = { ...emptyCategorySpending, ...Object.fromEntries(categoryOptions.map((category) => [category.key, Number(form[category.key] || 0)])) }
  const total = calculateCategoryTotal(spending)
  const hasNegative = Object.values(form).some((value) => Number(value || 0) < 0)
  const error = hasNegative ? 'Values must be 0 or greater.' : total <= 0 ? 'Enter at least one category greater than 0.' : ''
  const isValid = useMemo(() => error === '', [error])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    saveLastMonthSpending(spending)
    navigate('/setup/this-month')
  }

  return (
    <Layout wide>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Last Month Spending</h1>
        <p className="mt-2 text-slate-600">Enter what you spent last month so SpendWise can compare your progress.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {categoryOptions.map((category) => (
            <InputField key={category.key} label={category.label} name={category.key} type="number" min="0" value={form[category.key]} onChange={(event) => setForm((current) => ({ ...current, [category.key]: event.target.value }))} placeholder="0" />
          ))}
        </div>
        {submitted && error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <p className="mt-4 text-sm font-semibold text-slate-600">Last month total: ${total.toFixed(2)}</p>
        <PrimaryButton type="submit" disabled={!isValid} className="mt-7">Continue to This Month Spending</PrimaryButton>
      </form>
    </Layout>
  )
}

export default LastMonthSpendingPage