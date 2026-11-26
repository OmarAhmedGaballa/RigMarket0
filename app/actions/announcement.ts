'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/session'
import { getI18n } from '@/lib/i18n/server'
import { clearAnnouncement, publishAnnouncement } from '@/lib/announcement'
import { ANNOUNCEMENT_MAX_LENGTH } from '@/lib/announcement-shared'
import { text } from '@/lib/validation'
import type { FormState } from './listings'

/** Admin: show a notice bar at the top of the whole site for 24 hours. */
export async function saveAnnouncement(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return { error: t('err.unauthorized') }

  const body = text(formData, 'text', ANNOUNCEMENT_MAX_LENGTH)
  if (body.length < 2) return { error: t('an.errEmpty') }
  await publishAnnouncement(body)
  revalidatePath('/', 'layout')
  return { success: t('an.published') }
}

export async function removeAnnouncement(_prev: FormState, _formData: FormData): Promise<FormState> {
  const { t } = await getI18n()
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return { error: t('err.unauthorized') }
  await clearAnnouncement()
  revalidatePath('/', 'layout')
  return { success: t('an.removed') }
}
