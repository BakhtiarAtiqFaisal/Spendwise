import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { login, saveAccessToken } from '../api'
import { getUser, isSetupComplete, saveUser, setLoggedIn } from '../storage'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const emailError = email.trim() === '' ? 'Email is required.' : !email.includes('@') ? 'Enter a valid email address.' : ''
  const passwordError = password === '' ? 'Password is required.' : password.length < 6 ? 'Password must be at least 6 characters.' : ''
  const isValid = useMemo(() => !emailError && !passwordError, [emailError, passwordError])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setAuthError('')
    if (!isValid) return

    try {
      setIsLoading(true)
      const response = await login(email, password)
      saveAccessToken(response.access_token)
      const existingUser = getUser()
      const metadata = response.user?.user_metadata ?? {}
      saveUser({
        name: String(metadata.full_name ?? metadata.name ?? existingUser?.name ?? ''),
        email: response.user?.email ?? email,
        phone: String(metadata.phone_number ?? existingUser?.phone ?? ''),
        location: String(metadata.location ?? existingUser?.location ?? ''),
      })
      setLoggedIn()
      navigate(isSetupComplete() ? '/dashboard' : '/setup/planned-budget')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not log in. Please check your details and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-slate-600">Access your SpendWise account.</p>

        <div className="mt-8 space-y-5">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={submitted ? emailError : ''}
            placeholder="student@email.com"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={submitted ? passwordError : ''}
            placeholder="At least 6 characters"
          />
        </div>

        {authError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{authError}</p>}

        <PrimaryButton type="submit" disabled={!isValid || isLoading} className="mt-7">
          {isLoading ? 'Logging in...' : 'Login'}
        </PrimaryButton>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to SpendWise?{' '}
          <Link to="/create-account" className="font-semibold text-brand-700 hover:underline">
            Create Account
          </Link>
        </p>
      </form>
    </Layout>
  )
}

export default LoginPage