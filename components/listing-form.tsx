'use client'

import { adminUpdateListing, createListing } from '@/app/actions/listings'
import type { Listing } from '@/lib/db/schema'
import { CATEGORIES, CATEGORY_GROUPS, CONDITIONS, categoryName, groupName } from '@/lib/categories'
import { CURRENCY, MAX_STOCK } from '@/lib/config'
import { useFormAction } from '@/lib/use-form-action'
import { useI18n } from '@/components/i18n-provider'
import { ImageInput } from '@/components/image-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const selectClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-card [&>optgroup]:bg-card'

type Props =
  | { mode: 'create'; listing?: undefined }
  | { mode: 'admin-edit'; listing: Listing }

export function ListingForm({ mode, listing }: Props) {
  const { t, locale } = useI18n()
  const isEdit = mode === 'admin-edit'
  const { state, onSubmit, pending } = useFormAction(isEdit ? adminUpdateListing : createListing)

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
      {isEdit && <input type="hidden" name="id" value={listing.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">{t('form.title')}</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={4}
          maxLength={120}
          defaultValue={listing?.title}
          placeholder={t('form.titlePh')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">{t('form.category')}</Label>
          <select id="category" name="category" required defaultValue={listing?.category ?? ''} className={selectClass}>
            <option value="" disabled>
              {t('form.selectCategory')}
            </option>
            {CATEGORY_GROUPS.map((group) => (
              <optgroup key={group} label={groupName(group, locale)}>
                {CATEGORIES.filter((c) => c.group === group).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {categoryName(c, locale)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="condition">{t('form.condition')}</Label>
          <select id="condition" name="condition" required defaultValue={listing?.condition ?? 'used'} className={selectClass}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {locale === 'ar' ? c.labelAr : c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="brand">{t('form.brand')}</Label>
          <Input id="brand" name="brand" maxLength={60} defaultValue={listing?.brand ?? ''} placeholder={t('form.brandPh')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">{t('form.price', { currency: CURRENCY })}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={listing?.price}
            placeholder={t('form.pricePh')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="stock">{t('form.stock')}</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            inputMode="numeric"
            min={isEdit ? 0 : 1}
            max={MAX_STOCK}
            step={1}
            required
            defaultValue={listing?.stock ?? 1}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          defaultValue={listing?.description}
          placeholder={t('form.descPh')}
        />
      </div>

      <ImageInput
        name="photo"
        label={t('form.photo')}
        hint={t('form.photoHint')}
        required={!isEdit}
        existingUrl={listing?.imageUrl}
      />
      {isEdit && listing.imageUrl && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="removePhoto" className="size-4 accent-[var(--primary)]" />
          {t('form.photoRemove')}
        </label>
      )}

      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="location">{t('form.location')}</Label>
        <Input id="location" name="location" maxLength={80} defaultValue={listing?.location ?? ''} placeholder={t('form.locationPh')} />
      </div>

      {isEdit && (
        <div className="grid gap-5 rounded-xl border bg-card p-4 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">{t('form.status')}</Label>
            <select id="status" name="status" defaultValue={listing.status} className={selectClass}>
              {(['pending', 'approved', 'declined'] as const).map((s) => (
                <option key={s} value={s}>
                  {t(`status.listing.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adminNote">{t('form.adminNote')}</Label>
            <Textarea id="adminNote" name="adminNote" rows={2} maxLength={500} defaultValue={listing.adminNote ?? ''} />
          </div>
        </div>
      )}

      {state?.error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {isEdit ? (pending ? t('form.saving') : t('form.save')) : pending ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  )
}
