import 'server-only'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { images } from '@/lib/db/schema'
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/config'

export type UploadError = 'photoType' | 'photoSize' | 'photoRequired'

function sniffMime(buf: Buffer): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png'
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP')
    return 'image/webp'
  return null
}

/** Returns true when the form field holds a real, non-empty file. */
export function hasFile(value: FormDataEntryValue | null): value is File {
  return typeof value === 'object' && value !== null && 'arrayBuffer' in value && value.size > 0
}

/**
 * Validates (size + real file signature, not the client-supplied type) and stores an uploaded image.
 * kind 'listing' is public; kind 'id' is only ever served to admins and the owner.
 */
export async function saveImage(
  file: File,
  opts: { userId: string; kind: 'listing' | 'id' },
): Promise<{ ok: true; id: string } | { ok: false; error: UploadError }> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'photoSize' }
  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > MAX_UPLOAD_BYTES) return { ok: false, error: 'photoSize' }
  const mime = sniffMime(buf)
  if (!mime) return { ok: false, error: 'photoType' }
  const id = randomUUID()
  await db.insert(images).values({ id, userId: opts.userId, kind: opts.kind, mimeType: mime, data: buf })
  return { ok: true, id }
}

export const imageUrlFor = (id: string) => `/api/images/${id}`

export function imageIdFromUrl(url: string | null | undefined) {
  const m = url?.match(/^\/api\/images\/([0-9a-f-]{36})$/)
  return m ? m[1] : null
}

export async function deleteImage(id: string | null | undefined) {
  if (!id) return
  await db.delete(images).where(eq(images.id, id))
}
