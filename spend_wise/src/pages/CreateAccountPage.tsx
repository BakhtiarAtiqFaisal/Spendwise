import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import PrimaryButton from '../components/PrimaryButton'
import { saveAccessToken, signup } from '../api'
import { clearSetupDataForNewAccount, saveUser, setLoggedIn } from '../storage'

function CreateAccountPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const nameError = name.trim() === '' ? 'Full name is required.' : ''
  const emailError = email.trim() === '' ? 'Email is required.' : !email.includes('@') ? 'Enter a valid email address.' : ''
  const phoneError = phone.trim() === '' ? 'Phone number is required.' : ''
  const locationError = location.trim() === '' ? 'Location is required.' : ''
  const passwordError = password === '' ? 'Password is required.' : password.length < 6 ? 'Password must be at least 6 characters.' : ''
  const confirmPasswordError = confirmPassword === '' ? 'Please confirm your password.' : confirmPassword !== password ? 'Passwords must match.' : ''
  const termsError = !acceptedTerms ? 'You must accept the Terms of Service and Privacy Policy.' : ''

  const isValid = useMemo(
    () => !nameError && !emailError && !phoneError && !locationError && !passwordError && !confirmPasswordError && !termsError,
    [nameError, emailError, phoneError, locationError, passwordError, confirmPasswordError, termsError],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setAuthError('')
    if (!isValid) return

    try {
      setIsLoading(true)
      const user = { name, email, phone, location }
      const response = await signup(user, password)
      saveAccessToken(response.access_token)
      clearSetupDataForNewAccount()
      saveUser(user)
      setLoggedIn()
      navigate('/setup/planned-budget')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not create your account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
        <p className="mt-2 text-slate-600">Set up your SpendWise profile.</p>

        <div className="mt-8 space-y-5">
          <InputField label="Full name" name="name" value={name} onChange={(event) => setName(event.target.value)} error={submitted ? nameError : ''} placeholder="Your name" />
          <InputField label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={submitted ? emailError : ''} placeholder="student@email.com" />
          <InputField label="Phone number" name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} error={submitted ? phoneError : ''} placeholder="0400 000 000" />
          <InputField label="Location" name="location" value={location} onChange={(event) => setLocation(event.target.value)} error={submitted ? locationError : ''} placeholder="Melbourne, Australia" />
          <InputField label="Password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={submitted ? passwordError : ''} placeholder="At least 6 characters" />
          <InputField label="Confirm password" name="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={submitted ? confirmPasswordError : ''} placeholder="Repeat your password" />

          <div>
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              <span>I accept the Terms of Service and Privacy Policy.</span>
            </label>
            {submitted && termsError && <p className="mt-1 text-sm text-red-600">{termsError}</p>}
          </div>
        </div>

        {authError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{authError}</p>}

        <PrimaryButton type="submit" disabled={!isValid || isLoading} className="mt-7">
          {isLoading ? 'Creating account...' : 'Create Account'}
        </PrimaryButton>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </Layout>
  )
}

export default CreateAccountPage