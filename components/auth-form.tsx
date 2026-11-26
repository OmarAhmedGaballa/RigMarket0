'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { requestVerificationCode, submitVerificationCode } from '@/app/actions/verification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/components/i18n-provider'

type Provider = 'google' | 'facebook'
const RESEND_SECONDS = 60

export function AuthForm({ mode, providers = [] }: { mode: 'sign-in' | 'sign-up'; providers?: Provider[] }) {
  const router = useRouter()
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [cooldown, setCooldown] = useState(0)
  // Kept only in memory so we can sign the user in right after the code is accepted.
  const creds = useRef({ email: '', password: '', remember: true })
  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function sendCode() {
    const r = await requestVerificationCode(creds.current.email)
    if (r.error) {
      setError(r.error)
      if (r.retryAfter) setCooldown(r.retryAfter)
      return false
    }
    setCooldown(RESEND_SECONDS)
    return true
  }

  async function finishSignIn() {
    const { error } = await authClient.signIn.email({
      email: creds.current.email,
      password: creds.current.password,
      rememberMe: creds.current.remember,
    })
    if (error) return false
    router.push(next)
    router.refresh()
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const name = String(fd.get('name') ?? '')
    const remember = fd.get('remember') === 'on'
    creds.current = { email, password, remember }

    if (isSignUp) {
      const { error } = await authClient.signUp.email({ email, password, name })
      if (error) {
        setLoading(false)
        setError(t('auth.errSignUp'))
        return
      }
      await sendCode()
      setLoading(false)
      setStep('verify')
      return
    }

    const { error } = await authClient.signIn.email({ email, password, rememberMe: remember })
    if (error) {
      setLoading(false)
      // 403 = correct password but the email was never verified: send a code and ask for it.
      if (error.status === 403 || /verif/i.test(error.code ?? '') || /verif/i.test(error.message ?? '')) {
        await sendCode()
        setStep('verify')
        return
      }
      setError(t('auth.errSignIn'))
      return
    }
    setLoading(false)
    router.push(next)
    router.refresh()
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
    const r = await submitVerificationCode(creds.current.email, code)
    if (r.error) {
      setLoading(false)
      setError(r.error)
      return
    }
    const ok = await finishSignIn()
    setLoading(false)
    if (!ok) {
      // Verified, but the password we kept doesn't match (e.g. the account already existed): ask to sign in.
      setStep('form')
      setInfo(t('vf.verifiedSignIn'))
      if (isSignUp) router.push(`/sign-in${rawNext ? `?next=${encodeURIComponent(next)}` : ''}`)
    }
  }

  async function handleResend() {
    setError(null)
    setInfo(null)
    setLoading(true)
    const ok = await sendCode()
    setLoading(false)
    if (ok) setInfo(t('vf.sent'))
  }

  async function social(provider: Provider) {
    setError(null)
    await authClient.signIn.social({ provider, callbackURL: next })
  }

  if (step === 'verify') {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">{t('vf.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('vf.text')} <bdi dir="ltr" className="font-medium text-foreground">{creds.current.email}</bdi>
        </p>
        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">{t('vf.code')}</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              dir="ltr"
              className="text-center font-mono text-2xl tracking-[0.5em]"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-sm text-success">
              {info}
            </p>
          )}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? t('auth.wait') : t('vf.verify')}
          </Button>
          <Button type="button" variant="ghost" disabled={loading || cooldown > 0} onClick={handleResend}>
            {cooldown > 0 ? t('vf.resendIn', { n: cooldown }) : t('vf.resend')}
          </Button>
          <button
            type="button"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep('form')
              setError(null)
              setInfo(null)
            }}
          >
            {t('vf.change')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{isSignUp ? t('auth.signUp.title') : t('auth.signIn.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isSignUp ? t('auth.signUp.text') : t('auth.signIn.text')}
      </p>

      {providers.length > 0 && (
        <div className="mt-8 flex flex-col gap-2">
          {providers.includes('google') && (
            <Button type="button" variant="outline" size="lg" onClick={() => social('google')}>
              {t('auth.google')}
            </Button>
          )}
          {providers.includes('facebook') && (
            <Button type="button" variant="outline" size="lg" onClick={() => social('facebook')}>
              {t('auth.facebook')}
            </Button>
          )}
          <p className="my-2 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            {t('auth.or')}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={providers.length > 0 ? 'flex flex-col gap-4' : 'mt-8 flex flex-col gap-4'}>
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remember" defaultChecked className="size-4 accent-[var(--primary)]" />
          {t('auth.remember')}
        </label>
        {info && (
          <p role="status" className="text-sm text-success">
            {info}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? t('auth.wait') : isSignUp ? t('auth.create') : t('auth.signIn')}
        </Button>
        {isSignUp && (
          <p className="text-center text-xs text-muted-foreground">
            {t('auth.agree')}{' '}
            <Link href="/terms" className="text-primary hover:underline">
              {t('legal.terms')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              {t('legal.privacy')}
            </Link>
          </p>
        )}
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
