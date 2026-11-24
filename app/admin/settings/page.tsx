import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/session'
import { getCommissionRate } from '@/lib/settings'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { CommissionForm } from '@/components/commission-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

export default async function AdminSettingsPage() {
  await requireAdmin()
  const [{ t }, rate] = await Promise.all([getI18n(), getCommissionRate()])
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('as.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('as.subtitle')}</p>
      <AdminNav active="settings" />
      <CommissionForm rate={rate} />
    </div>
  )
}
