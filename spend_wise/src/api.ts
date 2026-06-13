import type { User } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'spendwiseAccessToken'

type AuthResponse = {
  access_token?: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  user?: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
}

async function apiRequest<T>(path: string, body: unknown): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(`Cannot reach backend. Make sure FastAPI is running on ${API_BASE_URL}.`)
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data?.detail?.msg ??
      data?.detail?.message ??
      data?.detail?.error_description ??
      data?.msg ??
      data?.message ??
      'Request failed. Please try again.'

    throw new Error(message)
  }

  return data as T
}

// Learning-backend token storage only. In production, tokens should be handled
// with proper verification and safer storage, such as secure httpOnly cookies.
export function saveAccessToken(token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function signup(user: User, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/signup', { ...user, password })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', { email, password })
}