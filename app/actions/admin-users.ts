'use server'

import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { account, session } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { getI18n } from '@/lib/i18n/server'
import type { FormState } from './listings'

/**
 * Passwords are stored as one-way hashes, so nobody (not even the admin) can read them.
 * What the admin can do is set a new one for an account, e.g. when a customer is locked out.
 */
export async function adminResetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'admin') return { error: t('err.unauthorized') }

  const userId = formData.get('id')
  const password = formData.get('password')
  if (typeof userId !== 'string' || !userId) return { error: t('err.invalid') }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return { error: t('err.newPassword') }
  }

  try {
    const ctx = await auth.$context
    const hash = await ctx.password.hash(password)
    const updated = await db
      .update(account)
      .set({ password: hash, updatedAt: new Date() })
      .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
      .returning({ id: account.id })
    if (updated.length === 0) return { error: t('err.noPasswordAccount') }
    // Sign the user out everywhere so the old password stops working immediately.
    await db.delete(session).where(eq(session.userId, userId))
  } catch (err) {
    console.error('adminResetPassword failed', err)
    return { error: t('err.generic') }
  }
  return { success: t('au.pwSaved') }
}
