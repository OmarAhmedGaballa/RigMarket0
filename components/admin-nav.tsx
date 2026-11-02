import Link from 'next/link'
import { getI18n } from '@/lib/i18n/server'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { key: 'ads', href: '/admin', label: 'admin.nav.ads' },
  { key: 'orders', href: '/admin/orders', label: 'admin.nav.orders' },
  { key: 'payments', href: '/admin/payments', label: 'admin.nav.payments' },
] as const

export async function AdminNav({ active }: { active: (typeof SECTIONS)[number]['key'] }) {
  const { t } = await getI18n()
  return (
    <nav className="mb-6 flex gap-1 border-b" aria-label={t('admin.nav.label')}>
      {SECTIONS.map((s) => (
        <Link
          key={s.key}
          href={s.href}
          aria-current={active === s.key ? 'page' : undefined}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
            active === s.key
              ? 'border-primary font-medium text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t(s.label)}
        </Link>
      ))}
    </nav>
  )
}
