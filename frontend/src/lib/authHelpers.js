import { supabase } from './supabaseClient'

const BASE_PATHS = { admin: '/a', officer: '/o', worker: '/w', citizen: '/c' }

// Creates a citizen profile the first time a user verifies their email
export async function ensureProfile(user) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return { error: null }

  const { error } = await supabase
    .from('profiles')
    .insert({ id: user.id, role: 'citizen', is_disabled: false })

  return { error }
}

// Works out where a signed-in user belongs. Signs them out if the account is disabled.
export async function getDestination(user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_disabled, profile_completion')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.is_disabled) {
    await supabase.auth.signOut()
    return { disabled: true }
  }

  const base = BASE_PATHS[profile?.role] || '/c'
  const completion = profile?.profile_completion || 0

  return { path: completion === 0 ? `${base}/profile` : `${base}/dashboard` }
}