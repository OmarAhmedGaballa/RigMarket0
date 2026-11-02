'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/components/i18n-provider'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '')
    const password = String(fd.get('password') ?? '')
    const name = String(fd.get('name') ?? '')

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)
    if (error) {
      setError(isSignUp ? t('auth.errSignUp') : t('auth.errSignIn'))
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{isSignUp ? t('auth.signUp.title') : t('auth.signIn.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isSignUp ? t('auth.signUp.text') : t('auth.signIn.text')}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t('auth.name')}</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" name="email" type="email" dir="ltr" required autoComplete="email" className="text-start" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? t('auth.wait') : isSignUp ? t('auth.create') : t('auth.signIn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? t('auth.haveAccount') : t('auth.newHere')}{' '}
        <Link
          href={`${isSignUp ? '/sign-in' : '/sign-up'}${rawNext ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-primary hover:underline"
        >
          {isSignUp ? t('auth.signIn') : t('auth.signUp.title')}
        </Link>
      </p>
    </div>
  )
}
