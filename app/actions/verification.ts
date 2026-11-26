'use server'

import { sendVerificationCode, verifyCode } from '@/lib/verification'
import { getI18n } from '@/lib/i18n/server'

export type CodeState = { ok?: boolean; error?: string; retryAfter?: number }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Sends (or re-sends) the 6-digit code. Always answers ok for unknown emails so accounts can't be probed. */
export async function requestVerificationCode(email: string): Promise<CodeState> {
  const { t } = await getI18n()
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) return { error: t('err.invalid') }
  const r = await sendVerificationCode(email)
  if (r.ok) return { ok: true }
  if (r.reason === 'cooldown') return { error: t('vf.errCooldown', { n: r.retryAfter ?? 60 }), retryAfter: r.retryAfter }
  if (r.reason === 'limit') return { error: t('vf.errLimit') }
  return { error: t('vf.errMail') }
}

export async function submitVerificationCode(email: string, code: string): Promise<CodeState> {
  const { t } = await getI18n()
  if (typeof email !== 'string' || typeof code !== 'string' || !EMAIL_RE.test(email.trim())) return { error: t('err.invalid') }
  const r = await verifyCode(email, code)
  if (r.ok) return { ok: true }
  if (r.reason === 'expired') return { error: t('vf.errExpired') }
  if (r.reason === 'tooMany') return { error: t('vf.errTooMany') }
  return { error: t('vf.errInvalid') }
}
