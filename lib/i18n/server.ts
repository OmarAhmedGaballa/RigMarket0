import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { en } from './dictionaries'
import { ar } from './ar'
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirOf, isLocale, makeT, type Locale, type Messages } from './index'

export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(saved)) return saved
  const accept = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  if (accept.startsWith('ar')) return 'ar'
  return DEFAULT_LOCALE
})

export function messagesFor(locale: Locale): Messages {
  return locale === 'ar' ? ar : en
}

/** For server components and server actions. */
export async function getI18n() {
  const locale = await getLocale()
  const messages = messagesFor(locale)
  return { locale, dir: dirOf(locale), messages, t: makeT(messages) }
}
