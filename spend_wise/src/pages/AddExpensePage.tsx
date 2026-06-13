import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { addToThisMonthSpending, categoryOptions, getExpenses, saveExpenses, saveLatestExpense } from '../storage'
import type { Expense } from '../types'

function AddExpensePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const titleError = title.trim() === '' ? 'Expense title is required.' : ''
  const amountError = amount.trim() === '' ? 'Amount is required.' : Number(amount) <= 0 ? 'Amount must be a positive number.' : ''
  const categoryError = category === '' ? 'Please choose a category.' : ''
  const dateError = date === '' ? 'Date is required.' : ''
  const isValid = useMemo(() => !titleError && !amountError && !categoryError && !dateError, [titleError, amountError, categoryError, dateError])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      title,
      amount: Number(amount),
      category,
      date,
    }

    const updatedExpenses = [...getExpenses(), newExpense]
    saveExpenses(updatedExpenses)
    saveLatestExpense(newExpense)
    addToThisMonthSpending(category, Number(amount))
    navigate('/confirmation')
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900">Add Expense</h1>
        <p className="mt-2 text-slate-600">Record a new spending item and update your balance.</p>

        <div className="mt-8 space-y-5">
          <InputField label="Expense title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} error={submitted ? titleError : ''} placeholder="Lunch, rent, bus pass..." />
          <InputField label="Amount" name="amount" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} error={submitted ? amountError : ''} placeholder="25" />

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-blue-100 ${submitted && categoryError ? 'border-red-400' : 'border-slate-200'}`}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
            {submitted && categoryError && <p className="mt-1 text-sm text-red-600">{categoryError}</p>}
          </div>

          <InputField label="Date" name="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} error={submitted ? dateError : ''} />
        </div>

        <PrimaryButton type="submit" disabled={!isValid} className="mt-7">
          Add Expense
        </PrimaryButton>
      </form>
    </Layout>
  )
}

export default AddExpensePage