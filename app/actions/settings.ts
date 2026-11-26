'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import { MAX_PRICE } from '@/lib/config'
import { MAX_COMMISSION_RATE } from '@/lib/pricing'
import { setCommissionRate } from '@/lib/settings'
import { getCurrentUser } from '@/lib/session'
import { getI18n } from '@/lib/i18n/server'
import type { FormState } from './listings'

/** Admin only: change the site-wide commission, optionally re-pricing every live ad. */
export async function saveCommission(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return { error: t('err.unauthorized') }

  const raw = formData.get('rate')
  // Accept "1,5" as well as "1.5".
  const rate = typeof raw === 'string' ? Number(raw.trim().replace(',', '.')) : NaN
  if (!Number.isFinite(rate) || rate < 0 || rate > MAX_COMMISSION_RATE) {
    return { error: t('err.commission', { max: MAX_COMMISSION_RATE }) }
  }
  const rounded = Math.round(rate * 100) / 100
  await setCommissionRate(rounded)

  let updated = 0
  if (formData.get('applyToLive') === 'on') {
    const factor = 1 + rounded / 100
    const res = await db
      .update(listings)
      .set({
        price: sql`least(round(coalesce(${listings.sellerPrice}, ${listings.price}) * ${factor}::numeric)::int, ${MAX_PRICE})`,
        sellerPrice: sql`coalesce(${listings.sellerPrice}, ${listings.price})`,
        originalPrice: sql`case when ${listings.originalSellerPrice} is null then null else least(round(${listings.originalSellerPrice} * ${factor}::numeric)::int, ${MAX_PRICE}) end`,
        updatedAt: new Date(),
      })
      .where(eq(listings.status, 'approved'))
      .returning({ id: listings.id })
    updated = res.length
  }

  revalidatePath('/', 'layout')
  return { success: updated > 0 ? t('as.savedApplied', { n: updated }) : t('as.saved') }
}
