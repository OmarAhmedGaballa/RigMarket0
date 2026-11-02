import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getListingForAdmin } from '@/lib/queries'
import { getI18n } from '@/lib/i18n/server'
import { ListingForm } from '@/components/listing-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t('meta.admin') }
}

export default async function AdminEditListingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()
  const [{ t }, listing] = await Promise.all([getI18n(), getListingForAdmin(numericId)])
  if (!listing) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t('admin.edit.back')}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t('admin.edit.title')}</h1>
      <ListingForm mode="admin-edit" listing={listing} />
    </div>
  )
}
