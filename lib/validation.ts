export function text(formData: FormData, key: string, max: number) {
  const value = formData.get(key)
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export function parseIntInRange(raw: FormDataEntryValue | null, min: number, max: number) {
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value) || !Number.isInteger(value)) return null
  if (value < min || value > max) return null
  return value
}

/** Strips spaces/dashes/brackets. Accepts an optional leading + and 8 to 15 digits. */
export function normalizePhone(raw: string) {
  const cleaned = raw.replace(/[\s\-().]/g, '')
  return /^\+?\d{8,15}$/.test(cleaned) ? cleaned : null
}
