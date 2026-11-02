'use client'

import { cn } from '@/lib/utils'
import { useI18n } from '@/components/i18n-provider'
import type { MessageKey } from '@/lib/i18n/dictionaries'

const TONES = {
  warning: 'bg-warning/15 text-warning border-warning/30',
  success: 'bg-success/15 text-success border-success/30',
  danger: 'bg-destructive/15 text-destructive border-destructive/30',
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-primary/10 text-primary border-primary/30',
} as const

const LISTING: Record<string, keyof typeof TONES> = { pending: 'warning', approved: 'success', declined: 'danger' }
const ORDER: Record<string, keyof typeof TONES> = {
  placed: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}
const PAY: Record<string, keyof typeof TONES> = { unpaid: 'warning', paid: 'success', refunded: 'neutral' }

function Badge({ tone, label }: { tone: keyof typeof TONES; label: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {label}
    </span>
  )
}

/** Listing review status (pending / live / declined). */
export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  const key = (LISTING[status] ? status : 'pending') as 'pending' | 'approved' | 'declined'
  return <Badge tone={LISTING[key]} label={t(`status.listing.${key}` as MessageKey)} />
}

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  return <Badge tone={ORDER[status] ?? 'neutral'} label={t(`status.order.${status}` as MessageKey)} />
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  return <Badge tone={PAY[status] ?? 'neutral'} label={t(`status.pay.${status}` as MessageKey)} />
}
