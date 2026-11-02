import { CURRENCY } from '@/lib/config'
import type { MessageKey } from './dictionaries'

export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar'
}

export function dirOf(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export type Vars = Record<string, string | number>
export type Messages = Record<MessageKey, string>
export type TFunction = (key: MessageKey, vars?: Vars) => string

export function makeT(messages: Messages): TFunction {
  return (key, vars) =>
    (messages[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? ''))
}

/** Western digits in both languages so prices match the numeric inputs. */
function numberLocale(locale: Locale) {
  return locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'
}

export function formatPrice(value: number, locale: Locale = 'en') {
  return new Intl.NumberFormat(numberLocale(locale), {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: Date | string, locale: Locale = 'en') {
  return new Intl.DateTimeFormat(numberLocale(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
