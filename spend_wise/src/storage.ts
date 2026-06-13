import type { Budget, CategorySpending, Expense, PlannedBudget, User } from './types'

const OLD_USER_KEY = 'user'
const USER_KEY = 'spendwiseUserProfile'
const LOGIN_KEY = 'spendwiseIsLoggedIn'
const OLD_BUDGET_KEY = 'budget'
const PLANNED_BUDGET_KEY = 'spendwisePlannedBudget'
const LAST_MONTH_KEY = 'spendwiseLastMonthSpending'
const THIS_MONTH_KEY = 'spendwiseThisMonthSpending'
const SETUP_COMPLETE_KEY = 'spendwiseSetupComplete'
const EXPENSES_KEY = 'expenses'
const OLD_EXPENSES_KEY = 'spendwiseExpenses'
const LATEST_EXPENSE_KEY = 'latestExpense'

export const categoryOptions = [
  { key: 'rent', label: 'Rent' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'transport', label: 'Transport' },
  { key: 'bills', label: 'Bills' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'education', label: 'Education' },
  { key: 'health', label: 'Health' },
  { key: 'eatingOut', label: 'Eating Out' },
  { key: 'other', label: 'Other' },
] as const

export const emptyCategorySpending: CategorySpending = {
  rent: 0,
  groceries: 0,
  transport: 0,
  bills: 0,
  entertainment: 0,
  insurance: 0,
  education: 0,
  health: 0,
  eatingOut: 0,
  other: 0,
}

// These helper functions keep localStorage code simple and reusable for the MVP.
export function getUser(): User | null {
  const savedUser = localStorage.getItem(USER_KEY)
  if (savedUser) return JSON.parse(savedUser)

  // Fallback keeps older saved profiles working if they were saved before the profile key changed.
  const oldSavedUser = localStorage.getItem(OLD_USER_KEY)
  if (!oldSavedUser) return null

  const oldUser = JSON.parse(oldSavedUser) as { name: string; email: string }
  return { name: oldUser.name, email: oldUser.email, phone: '', location: '' }
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function setLoggedIn() {
  localStorage.setItem(LOGIN_KEY, 'true')
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(LOGIN_KEY) === 'true'
}

export function logOut() {
  localStorage.removeItem(LOGIN_KEY)
}

export function isSetupComplete(): boolean {
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true'
}

export function setSetupComplete() {
  localStorage.setItem(SETUP_COMPLETE_KEY, 'true')
}

export function getPlannedBudget(): PlannedBudget | null {
  const savedBudget = localStorage.getItem(PLANNED_BUDGET_KEY)
  if (savedBudget) return JSON.parse(savedBudget)

  // Fallback: map older 5-category budget data into the new 10-category shape if it exists.
  const oldBudget = localStorage.getItem(OLD_BUDGET_KEY)
  if (!oldBudget) return null

  const parsed = JSON.parse(oldBudget) as Partial<Record<keyof CategorySpending | 'income', number>>
  return {
    income: parsed.income ?? 0,
    savingsGoal: 0,
    categories: {
      ...emptyCategorySpending,
      rent: parsed.rent ?? 0,
      groceries: parsed.groceries ?? 0,
      transport: parsed.transport ?? 0,
      bills: parsed.bills ?? 0,
      other: parsed.other ?? 0,
    },
  }
}

export function savePlannedBudget(budget: PlannedBudget) {
  localStorage.setItem(PLANNED_BUDGET_KEY, JSON.stringify(budget))
}

export function getBudget(): Budget | null {
  return getPlannedBudget()
}

export function saveBudget(budget: Budget) {
  savePlannedBudget(budget)
}

export function getLastMonthSpending(): CategorySpending | null {
  const saved = localStorage.getItem(LAST_MONTH_KEY)
  return saved ? { ...emptyCategorySpending, ...JSON.parse(saved) } : null
}

export function saveLastMonthSpending(spending: CategorySpending) {
  localStorage.setItem(LAST_MONTH_KEY, JSON.stringify(spending))
}

export function getThisMonthSpending(): CategorySpending | null {
  const saved = localStorage.getItem(THIS_MONTH_KEY)
  return saved ? { ...emptyCategorySpending, ...JSON.parse(saved) } : null
}

export function saveThisMonthSpending(spending: CategorySpending) {
  localStorage.setItem(THIS_MONTH_KEY, JSON.stringify(spending))
}

export function addToThisMonthSpending(category: string, amount: number) {
  if (!(category in emptyCategorySpending)) return
  const current = getThisMonthSpending() ?? { ...emptyCategorySpending }
  const categoryKey = category as keyof CategorySpending
  current[categoryKey] += amount
  saveThisMonthSpending(current)
}

export function getExpenses(): Expense[] {
  const savedExpenses = localStorage.getItem(EXPENSES_KEY)
  return savedExpenses ? JSON.parse(savedExpenses) : []
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
}

export function clearExpenses() {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify([]))
  localStorage.removeItem(LATEST_EXPENSE_KEY)
}

export function clearSetupDataForNewAccount() {
  localStorage.removeItem(OLD_USER_KEY)
  localStorage.removeItem(OLD_BUDGET_KEY)
  localStorage.removeItem(PLANNED_BUDGET_KEY)
  localStorage.removeItem(LAST_MONTH_KEY)
  localStorage.removeItem(THIS_MONTH_KEY)
  localStorage.removeItem(SETUP_COMPLETE_KEY)
  localStorage.removeItem(EXPENSES_KEY)
  localStorage.removeItem(OLD_EXPENSES_KEY)
  localStorage.removeItem(LATEST_EXPENSE_KEY)
}

export function getLatestExpense(): Expense | null {
  const savedExpense = localStorage.getItem(LATEST_EXPENSE_KEY)
  return savedExpense ? JSON.parse(savedExpense) : null
}

export function saveLatestExpense(expense: Expense) {
  localStorage.setItem(LATEST_EXPENSE_KEY, JSON.stringify(expense))
}

export function calculateTotalBudget(budget: Budget | null): number {
  if (!budget) return 0
  return calculateCategoryTotal(budget.categories)
}

export function calculateTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function calculateCategoryTotal(spending: CategorySpending | null): number {
  if (!spending) return 0
  return Object.values(spending).reduce((total, amount) => total + amount, 0)
}