import 'server-only'
import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { DEFAULT_COMMISSION_RATE, MAX_COMMISSION_RATE } from '@/lib/pricing'

export const COMMISSION_KEY = 'commission_rate'

/** Current commission in percent. Falls back to the default if the table is missing or the value is bad. */
export const getCommissionRate = cache(async (): Promise<number> => {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, COMMISSION_KEY))
    const n = row ? Number(row.value) : NaN
    return Number.isFinite(n) && n >= 0 && n <= MAX_COMMISSION_RATE ? n : DEFAULT_COMMISSION_RATE
  } catch {
    return DEFAULT_COMMISSION_RATE
  }
})

export async function setCommissionRate(rate: number) {
  await db
    .insert(settings)
    .values({ key: COMMISSION_KEY, value: String(rate) })
    .onConflictDoUpdate({ target: settings.key, set: { value: String(rate), updatedAt: new Date() } })
}
