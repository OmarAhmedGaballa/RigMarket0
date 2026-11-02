'use client'

import { createContext, useContext, useMemo } from 'react'
import { formatDate, formatPrice, makeT, type Locale, type Messages, type TFunction } from '@/lib/i18n'

type I18nValue = {
  locale: Locale
  t: TFunction
  price: (value: number) => string
  date: (value: Date | string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: makeT(messages),
      price: (v) => formatPrice(v, locale),
      date: (v) => formatDate(v, locale),
    }),
    [locale, messages],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
