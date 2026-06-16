import type { User } from './types'
import { getSupabaseClient } from './lib/supabase'

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
  setupCompleted?: boolean
}

// Learning-backend token storage only. In production, tokens should be handled
// with proper verification and safer storage, such as secure httpOnly cookies.
export function saveAccessToken(token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

type AuthUser = {
  id: string
  email?: string | null
  user_metadata: Record<string, unknown>
}

function authUserToResponse(authUser: AuthUser, accessToken?: string, setupCompleted?: boolean): AuthResponse {
  return {
    access_token: accessToken,
    user: {
      id: authUser.id,
      email: authUser.email ?? undefined,
      user_metadata: authUser.user_metadata,
    },
    setupCompleted,
  }
}

async function saveSignupProfile(supabase: ReturnType<typeof getSupabaseClient>, userId: string, user: User, termsAccepted: boolean) {
  const profile = {
    id: userId,
    full_name: user.name,
    email_address: user.email,
    phone_number: user.phone,
    location: user.location,
    terms_accepted: termsAccepted,
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from('spendwise')
    .update(profile)
    .eq('id', userId)
    .select('id')

  if (updateError) throw new Error(updateError.message)
  if (updatedRows && updatedRows.length > 0) return

  const { error: insertError } = await supabase.from('spendwise').insert(profile)

  if (!insertError) return

  if (insertError.code === '23505') {
    const { error: retryUpdateError } = await supabase
      .from('spendwise')
      .update(profile)
      .eq('id', userId)

    if (retryUpdateError) throw new Error(retryUpdateError.message)
    return
  }

  throw new Error(insertError.message)
}

export async function signup(user: User, password: string, termsAccepted: boolean): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password,
    options: {
      data: {
        full_name: user.name,
        name: user.name,
        phone_number: user.phone,
        location: user.location,
        terms_accepted: termsAccepted,
      },
    },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Sign-up did not return a user. Please try again.')

  if (data.session) {
    await saveSignupProfile(supabase, data.user.id, user, termsAccepted)
  }

  return authUserToResponse(data.user, data.session?.access_token, false)
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Login did not return a user. Please try again.')

  const { data: profile, error: profileError } = await supabase
    .from('spendwise')
    .select('full_name, email_address, phone_number, location')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)

  if (profile) {
    data.user.user_metadata = {
      ...data.user.user_metadata,
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      location: profile.location,
    }
  }

  const { data: budgetSetup, error: budgetError } = await supabase
    .from('budget_setups')
    .select('setup_completed')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (budgetError) throw new Error(budgetError.message)

  return authUserToResponse(data.user, data.session.access_token, budgetSetup?.setup_completed === true)
}

export async function markBudgetSetupComplete() {
  const supabase = getSupabaseClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw new Error(userError.message)
  if (!userData.user) throw new Error('You must be logged in to save budget setup.')

  const userId = userData.user.id
  const { data: updatedRows, error: updateError } = await supabase
    .from('budget_setups')
    .update({ setup_completed: true })
    .eq('user_id', userId)
    .select('id')

  if (updateError) throw new Error(updateError.message)
  if (updatedRows && updatedRows.length > 0) return

  const { error: insertError } = await supabase.from('budget_setups').insert({
    user_id: userId,
    setup_completed: true,
  })

  if (!insertError) return

  if (insertError.code === '23505') {
    const { error: retryUpdateError } = await supabase
      .from('budget_setups')
      .update({ setup_completed: true })
      .eq('user_id', userId)

    if (retryUpdateError) throw new Error(retryUpdateError.message)
    return
  }

  throw new Error(insertError.message)
}