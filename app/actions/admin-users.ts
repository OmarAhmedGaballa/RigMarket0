'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { account, session, user } from '@/lib/db/schema'
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

  // A promoted admin must never be able to take over the primary admin (or another admin) by resetting their password.
  const [target] = await db.select({ role: user.role }).from(user).where(eq(user.id, userId))
  if (!target) return { error: t('err.invalid') }
  if (target.role === 'admin' && userId !== admin.id && !admin.isOwner) return { error: t('ro.errPwAdmin') }

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

/**
 * Promote / demote an account.
 * ONLY the primary admin (the owner) can do this. Admins that the owner promoted cannot promote anyone,
 * and the owner account itself can never be demoted. The check reads the database, not the session.
 */
export async function setAccountRole(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  const current = await getCurrentUser()
  if (!current) return { error: t('err.unauthorized') }

  const [me] = await db.select({ role: user.role, isOwner: user.isOwner }).from(user).where(eq(user.id, current.id))
  if (!me || me.role !== 'admin' || !me.isOwner) return { error: t('ro.errOwnerOnly') }

  const targetId = formData.get('id')
  const role = formData.get('role')
  if (typeof targetId !== 'string' || !targetId || (role !== 'admin' && role !== 'user')) return { error: t('err.invalid') }

  const [target] = await db.select({ isOwner: user.isOwner }).from(user).where(eq(user.id, targetId))
  if (!target) return { error: t('err.invalid') }
  if (target.isOwner) return { error: t('ro.errOwner') }

  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, targetId))
  // Role changed: make them sign in again so the new role applies everywhere right away.
  await db.delete(session).where(eq(session.userId, targetId))
  revalidatePath('/admin/users', 'layout')
  return { success: role === 'admin' ? t('ro.madeAdmin') : t('ro.madeUser') }
}
