import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { AuthForm } from '@/components/auth-form'

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect('/')
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
