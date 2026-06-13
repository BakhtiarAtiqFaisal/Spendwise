export type User = {
  name: string
  email: string
  phone: string
  location: string
}

export type CategorySpending = {
  rent: number
  groceries: number
  transport: number
  bills: number
  entertainment: number
  insurance: number
  education: number
  health: number
  eatingOut: number
  other: number
}

export type PlannedBudget = {
  income: number
  savingsGoal: number
  categories: CategorySpending
}

// Backwards-compatible budget type used by older MVP screens/data.
export type Budget = PlannedBudget

export type Expense = {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

export type BudgetCategory = keyof CategorySpending

export type CategoryOption = {
  key: BudgetCategory
  label: string
}