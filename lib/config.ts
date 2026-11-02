// Central place for store-wide settings.

/** WhatsApp customer service. Shown exactly like this to customers. */
export const SUPPORT_WHATSAPP_DISPLAY = '01005784374'
/** Same number in international format (Egypt +20) for wa.me links. */
export const SUPPORT_WHATSAPP_INTL = '201005784374'

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${SUPPORT_WHATSAPP_INTL}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/** All prices are stored as whole numbers in this currency. */
export const CURRENCY = 'EGP'

export const MAX_PRICE = 10_000_000
export const MAX_STOCK = 999
export const MAX_CART_LINES = 30
export const MAX_QTY_PER_LINE = 99

/** Uploads are stored in the database; keep them small. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
