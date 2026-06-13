import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { calculateCategoryTotal, categoryOptions, emptyCategorySpending, getPlannedBudget, savePlannedBudget } from '../storage'
import type { BudgetCategory, CategorySpending } from '../types'

type PlannedBudgetForm = {
  income: string
  savingsGoal: string
  categories: Record<BudgetCategory, string>
}

const initialForm: PlannedBudgetForm = {
  income: '',
  savingsGoal: '',
  categories: Object.fromEntries(categoryOptions.map((category) => [category.key, ''])) as Record<BudgetCategory, string>,
}

function PlannedBudgetSetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<PlannedBudgetForm>(() => {
    const savedBudget = getPlannedBudget()
    if (!savedBudget) return initialForm

    return {
      income: String(savedBudget.income),
      savingsGoal: String(savedBudget.savingsGoal),
      categories: Object.fromEntries(
        categoryOptions.map((category) => [category.key, String(savedBudget.categories[category.key] ?? '')]),
      ) as Record<BudgetCategory, string>,
    }
  })
  const [submitted, setSubmitted] = useState(false)

  const categories: CategorySpending = {
    ...emptyCategorySpending,
    ...Object.fromEntries(categoryOptions.map((category) => [category.key, Number(form.categories[category.key] || 0)])),
  }
  const plannedTotal = calculateCategoryTotal(categories)
  const income = Number(form.income)
  const savingsGoal = Number(form.savingsGoal)

  const incomeError = form.income.trim() === '' ? 'Monthly income is required.' : income <= 0 ? 'Monthly income must be greater than 0.' : ''
  const savingsGoalError = form.savingsGoal.trim() === '' ? 'Monthly savings goal is required.' : savingsGoal < 0 ? 'Savings goal must be 0 or greater.' : ''
  const categoryError = Object.values(form.categories).some((value) => Number(value || 0) < 0) ? 'Category values must be 0 or greater.' : ''
  const overIncomeError = income > 0 && plannedTotal > income ? 'Planned budget total cannot be higher than monthly income.' : ''
  const isValid = useMemo(() => !incomeError && !savingsGoalError && !categoryError && !overIncomeError, [incomeError, savingsGoalError, categoryError, overIncomeError])

  function updateCategory(category: BudgetCategory, value: string) {
    setForm((current) => ({ ...current, categories: { ...current.categories, [category]: value } }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    savePlannedBudget({ income, savingsGoal, categories })
    navigate('/setup/last-month')
  }

  return (
    <Layout wide>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Set Your Initial Goal & Planned Budget</h1>
        <p className="mt-2 text-slate-600">Enter your income, savings goal, and planned spending for each category.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <InputField label="Monthly income" name="income" type="number" min="0" value={form.income} onChange={(event) => setForm((current) => ({ ...current, income: event.target.value }))} error={submitted ? incomeError : ''} placeholder="2500" />
          <InputField label="Monthly savings goal" name="savingsGoal" type="number" min="0" value={form.savingsGoal} onChange={(event) => setForm((current) => ({ ...current, savingsGoal: event.target.value }))} error={submitted ? savingsGoalError : ''} placeholder="300" />
        </div>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Planned spending categories</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {categoryOptions.map((category) => (
            <InputField key={category.key} label={category.label} name={category.key} type="number" min="0" value={form.categories[category.key]} onChange={(event) => updateCategory(category.key, event.target.value)} placeholder="0" />
          ))}
        </div>

        {(submitted && (categoryError || overIncomeError)) && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{categoryError || overIncomeError}</p>}
        <p className="mt-4 text-sm font-semibold text-slate-600">Planned budget total: ${plannedTotal.toFixed(2)}</p>

        <PrimaryButton type="submit" disabled={!isValid} className="mt-7">Continue to Last Month Spending</PrimaryButton>
      </form>
    </Layout>
  )
}

export default PlannedBudgetSetupPage