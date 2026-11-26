import 'server-only'
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailCodes, user } from '@/lib/db/schema'
import { sendMail, verificationEmail } from '@/lib/mailer'

export const CODE_TTL_MINUTES = 10
export const RESEND_COOLDOWN_SECONDS = 60
const MAX_ATTEMPTS = 5
const MAX_SENDS_PER_HOUR = 6

const norm = (email: string) => email.trim().toLowerCase()

function hashCode(email: string, code: string) {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'rigmarket-dev-secret'
  return createHmac('sha256', secret).update(`${norm(email)}:${code}`).digest('hex')
}

export type SendResult = { ok: true } | { ok: false; reason: 'cooldown' | 'limit' | 'mail'; retryAfter?: number }

/**
 * Creates a fresh 6-digit code for an UNVERIFIED account and emails it.
 * For unknown or already-verified emails it does nothing but still answers ok, so nobody can use this
 * to find out which emails have an account.
 */
export async function sendVerificationCode(emailRaw: string): Promise<SendResult> {
  const email = norm(emailRaw)
  const [u] = await db.select({ id: user.id, verified: user.emailVerified }).from(user).where(eq(user.email, email))
  if (!u || u.verified) return { ok: true }

  const now = new Date()
  const [prev] = await db.select().from(emailCodes).where(eq(emailCodes.email, email))
  let windowStart = now
  let sentInWindow = 1
  if (prev) {
    const since = (now.getTime() - prev.sentAt.getTime()) / 1000
    if (since < RESEND_COOLDOWN_SECONDS) {
      return { ok: false, reason: 'cooldown', retryAfter: Math.ceil(RESEND_COOLDOWN_SECONDS - since) }
    }
    if (now.getTime() - prev.windowStart.getTime() < 3600_000) {
      if (prev.sentInWindow >= MAX_SENDS_PER_HOUR) return { ok: false, reason: 'limit' }
      windowStart = prev.windowStart
      sentInWindow = prev.sentInWindow + 1
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const row = {
    email,
    codeHash: hashCode(email, code),
    expiresAt: new Date(now.getTime() + CODE_TTL_MINUTES * 60_000),
    attempts: 0,
    sentAt: now,
    windowStart,
    sentInWindow,
  }
  await db.insert(emailCodes).values(row).onConflictDoUpdate({ target: emailCodes.email, set: row })

  try {
    await sendMail({ to: email, ...verificationEmail(code, CODE_TTL_MINUTES) })
  } catch (err) {
    console.error('Could not send verification email:', err)
    return { ok: false, reason: 'mail' }
  }
  return { ok: true }
}

export type VerifyResult = { ok: true } | { ok: false; reason: 'invalid' | 'expired' | 'tooMany' }

/** Checks the code. 5 wrong tries burn the code (the user must request a new one). */
export async function verifyCode(emailRaw: string, codeRaw: string): Promise<VerifyResult> {
  const email = norm(emailRaw)
  const code = codeRaw.replace(/\D/g, '')
  const [row] = await db.select().from(emailCodes).where(eq(emailCodes.email, email))
  if (!row) return { ok: false, reason: 'expired' }
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' }
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'tooMany' }

  const a = Buffer.from(row.codeHash)
  const b = Buffer.from(hashCode(email, code))
  const good = code.length === 6 && a.length === b.length && timingSafeEqual(a, b)
  if (!good) {
    await db.update(emailCodes).set({ attempts: row.attempts + 1 }).where(eq(emailCodes.email, email))
    return { ok: false, reason: row.attempts + 1 >= MAX_ATTEMPTS ? 'tooMany' : 'invalid' }
  }

  await db.update(user).set({ emailVerified: true, updatedAt: new Date() }).where(eq(user.email, email))
  // Used up: delete the code but keep nothing else. (sentAt cooldown no longer matters once verified.)
  await db.delete(emailCodes).where(eq(emailCodes.email, email))
  return { ok: true }
}
