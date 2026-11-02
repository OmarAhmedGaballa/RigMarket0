'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'

const MAX_BYTES = 4 * 1024 * 1024
const MAX_SIDE = 1600
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Shrinks big phone photos in the browser so uploads stay fast and under the size limit. */
async function downscale(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
    bitmap.close()
    return file
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  if (!blob) return file
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
}

type Props = {
  name: string
  label: string
  hint?: string
  required?: boolean
  /** Photo already saved on the server (edit forms). */
  existingUrl?: string | null
  /** Shown instead of a preview for private files such as ID photos. */
  hidePreview?: boolean
}

export function ImageInput({ name, label, hint, required, existingUrl, hidePreview }: Props) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = `${name}-input`

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function reset() {
    if (inputRef.current) inputRef.current.value = ''
    setPreview(null)
    setFileName(null)
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget
    const file = input.files?.[0]
    setError(null)
    if (!file) return reset()
    if (!TYPES.includes(file.type)) {
      reset()
      return setError(t('upload.badType'))
    }
    setBusy(true)
    let result = file
    try {
      result = await downscale(file)
    } catch {
      result = file // the server validates again, so falling back is safe
    }
    if (result.size > MAX_BYTES) {
      reset()
      setBusy(false)
      return setError(t('upload.tooBig'))
    }
    if (result !== file) {
      const dt = new DataTransfer()
      dt.items.add(result)
      input.files = dt.files
    }
    setFileName(file.name)
    setPreview(URL.createObjectURL(result))
    setBusy(false)
  }

  const shownPreview = hidePreview ? null : (preview ?? existingUrl ?? null)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm leading-none font-medium select-none">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {shownPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownPreview} alt="" className="size-24 rounded-lg border object-cover" />
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={required}
              onChange={onChange}
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium hover:bg-muted peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {fileName || shownPreview ? t('upload.change') : t('upload.choose')}
            </label>
            {fileName && (
              <button
                type="button"
                onClick={reset}
                aria-label={t('upload.clear')}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {fileName && (
            <p className="max-w-56 truncate text-xs text-muted-foreground" dir="auto">
              {fileName}
            </p>
          )}
        </div>
      </div>
      {busy && (
        <p role="status" className="text-xs text-muted-foreground">
          {t('upload.processing')}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
