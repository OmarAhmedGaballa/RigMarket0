import 'server-only'

/** Which social sign-in buttons to show (only the ones whose keys are set in the environment). */
export function authProviders(): ('google' | 'facebook')[] {
  const list: ('google' | 'facebook')[] = []
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) list.push('google')
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) list.push('facebook')
  return list
}
