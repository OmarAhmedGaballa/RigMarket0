import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/session'
import { getPaymentMethods } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { AdminNav } from '@/components/admin-nav'
import { PaymentMethodForm } from '@/components/payment-method-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

export default async function AdminPaymentsPage() {
  await requireAdmin()
  const [{ t }, methods] = await Promise.all([getI18n(), getPaymentMethods()])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('ap.title')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{t('ap.subtitle')}</p>
      <AdminNav active="payments" />

      {methods.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">{t('ap.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {methods.map((m) => (
            <li key={m.id}>
              <PaymentMethodForm method={m} />
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 mb-3 font-medium">{t('ap.add')}</h2>
      <PaymentMethodForm />
    </div>
  )
}
