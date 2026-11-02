import { auth } from '@/lib/auth'
import { getImage } from '@/lib/queries'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found', { status: 404 })

  const image = await getImage(id)
  if (!image) return new Response('Not found', { status: 404 })

  const headers: Record<string, string> = {
    'Content-Type': image.mimeType,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  }

  if (image.kind === 'id') {
    // Seller ID photos are private: only admins (and the person who uploaded it) may view them.
    const session = await auth.api.getSession({ headers: request.headers })
    const viewer = session?.user as { id: string; role?: string } | undefined
    if (!viewer || (viewer.role !== 'admin' && viewer.id !== image.userId)) {
      return new Response('Not found', { status: 404 })
    }
    headers['Cache-Control'] = 'private, no-store'
  } else {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }

  return new Response(new Uint8Array(image.data), { headers })
}
