import 'server-only'
import { cache } from 'react'
import { inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'

import { ANNOUNCEMENT_HOURS } from '@/lib/announcement-shared'

export { ANNOUNCEMENT_HOURS, ANNOUNCEMENT_MAX_LENGTH } from '@/lib/announcement-shared'
const KEYS = ['announcement_text', 'announcement_until', 'announcement_id'] as const

export type Announcement = { id: string; text: string; until: Date }

async function readRaw() {
  const rows = await db.select().from(settings).where(inArray(settings.key, [...KEYS]))
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<Record<(typeof KEYS)[number], string>>
}

/** The banner that is live right now (null if there is none or its 24 hours are over). */
export const getActiveAnnouncement = cache(async (): Promise<Announcement | null> => {
  try {
    const raw = await readRaw()
    const until = raw.announcement_until ? new Date(raw.announcement_until) : null
    if (!raw.announcement_text || !until || Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) return null
    return { id: raw.announcement_id ?? String(until.getTime()), text: raw.announcement_text, until }
  } catch {
    return null
  }
})

async function put(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
}

export async function publishAnnouncement(text: string) {
  const now = Date.now()
  await put('announcement_text', text)
  await put('announcement_until', new Date(now + ANNOUNCEMENT_HOURS * 3600_000).toISOString())
  await put('announcement_id', String(now))
}

export async function clearAnnouncement() {
  await put('announcement_until', new Date(0).toISOString())
}
