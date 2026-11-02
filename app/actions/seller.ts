'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { getSellerProfile } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { deleteImage, hasFile, saveImage } from '@/lib/uploads'
import { normalizePhone, text } from '@/lib/validation'
import type { FormState } from './listings'

/** Sellers must give a mobile number and an ID photo. Both stay private (admin-only). */
export async function saveSellerVerification(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser()
  const { t } = await getI18n()
  if (!current) return { error: t('err.signIn') }

  const phone = normalizePhone(text(formData, 'phone', 30))
  if (!phone) return { error: t('err.phone') }

  const existing = await getSellerProfile(current.id)
  const file = formData.get('idPhoto')
  let idImageId = existing.idImageId

  if (hasFile(file)) {
    const saved = await saveImage(file, { userId: current.id, kind: 'id' })
    if (!saved.ok) return { error: t(`err.${saved.error}`) }
    idImageId = saved.id
  }
  if (!idImageId) return { error: t('err.idRequired') }

  await db.update(user).set({ phone, idImageId, updatedAt: new Date() }).where(eq(user.id, current.id))
  if (existing.idImageId && existing.idImageId !== idImageId) await deleteImage(existing.idImageId)

  revalidatePath('/sell')
  redirect('/sell')
}
