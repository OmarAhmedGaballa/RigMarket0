import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { AuthForm } from '@/components/auth-form'
import { authProviders } from '@/lib/auth-providers'

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect('/')
  return (
    <Suspense>
      <AuthForm mode="sign-up" providers={authProviders()} />
    </Suspense>
  )
}
