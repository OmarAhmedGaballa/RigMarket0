'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { paymentMethods } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { getI18n } from '@/lib/i18n/server'
import { parseIntInRange, text } from '@/lib/validation'
import type { FormState } from './listings'

async function requireAdminOrNull() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

/** Creates a payment method (no id) or updates one (id present). Admin only. */
export async function savePaymentMethod(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  if (!(await requireAdminOrNull())) return { error: t('err.unauthorized') }

  const idRaw = formData.get('id')
  const id = typeof idRaw === 'string' && idRaw !== '' ? Number(idRaw) : null
  if (id !== null && !Number.isInteger(id)) return { error: t('err.invalid') }

  const nameEn = text(formData, 'nameEn', 60)
  const nameAr = text(formData, 'nameAr', 60)
  if (!nameEn || !nameAr) return { error: t('err.paymentName') }

  const values = {
    nameEn,
    nameAr,
    instructionsEn: text(formData, 'instructionsEn', 600),
    instructionsAr: text(formData, 'instructionsAr', 600),
    accountDetails: text(formData, 'accountDetails', 200),
    requiresReference: formData.get('requiresReference') === 'on',
    enabled: formData.get('enabled') === 'on',
  }

  if (id === null) {
    const code = text(formData, 'code', 30).toLowerCase()
    if (!/^[a-z0-9-]{2,30}$/.test(code)) return { error: t('err.code') }
    const [taken] = await db.select({ id: paymentMethods.id }).from(paymentMethods).where(eq(paymentMethods.code, code))
    if (taken) return { error: t('err.codeTaken') }
    const [{ next }] = await db.select({ next: sql<number>`coalesce(max(${paymentMethods.sortOrder}), 0) + 1` }).from(paymentMethods)
    await db.insert(paymentMethods).values({ code, ...values, sortOrder: next })
  } else {
    const sortOrder = parseIntInRange(formData.get('sortOrder'), 0, 1000) ?? 0
    await db.update(paymentMethods).set({ ...values, sortOrder }).where(eq(paymentMethods.id, id))
  }

  revalidatePath('/', 'layout')
  return { success: t('ap.saved') }
}

export async function deletePaymentMethod(id: number) {
  if (!(await requireAdminOrNull())) throw new Error('Forbidden')
  await db.delete(paymentMethods).where(eq(paymentMethods.id, id))
  revalidatePath('/', 'layout')
}
