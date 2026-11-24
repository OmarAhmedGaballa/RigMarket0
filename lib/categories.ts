import type { Locale } from '@/lib/i18n'

export type CategoryGroup = 'Laptops' | 'Phones & Tablets' | 'Core components' | 'Storage & power' | 'Peripherals'

export type Category = {
  slug: string
  name: string
  nameAr: string
  group: CategoryGroup
  image: string
}

export const CATEGORIES: Category[] = [
  { slug: 'gaming-laptops', name: 'Gaming Laptops', nameAr: 'لابتوبات الجيمنج', group: 'Laptops', image: '/images/cat-gaming-laptops.png' },
  { slug: 'business-laptops', name: 'Business Laptops', nameAr: 'لابتوبات الأعمال', group: 'Laptops', image: '/images/cat-business-laptops.png' },
  { slug: 'ultrabooks', name: 'Ultrabooks', nameAr: 'ألترابوك', group: 'Laptops', image: '/images/cat-ultrabooks.png' },
  { slug: 'mobiles', name: 'Mobile Phones', nameAr: 'موبايلات', group: 'Phones & Tablets', image: '/images/cat-mobiles.png' },
  { slug: 'iphone', name: 'iPhone', nameAr: 'آيفون', group: 'Phones & Tablets', image: '/images/cat-iphone.png' },
  { slug: 'tablets', name: 'Tablets', nameAr: 'تابلت', group: 'Phones & Tablets', image: '/images/cat-tablets.png' },
  { slug: 'ipad', name: 'iPad', nameAr: 'آيباد', group: 'Phones & Tablets', image: '/images/cat-ipad.png' },
  { slug: 'processors', name: 'Processors (CPU)', nameAr: 'المعالجات (CPU)', group: 'Core components', image: '/images/cat-processors.png' },
  { slug: 'graphics-cards', name: 'Graphics Cards (GPU)', nameAr: 'كروت الشاشة (GPU)', group: 'Core components', image: '/images/cat-gpu.png' },
  { slug: 'motherboards', name: 'Motherboards', nameAr: 'اللوحات الأم', group: 'Core components', image: '/images/cat-motherboards.png' },
  { slug: 'memory', name: 'Memory (RAM)', nameAr: 'الذاكرة (RAM)', group: 'Core components', image: '/images/cat-memory.png' },
  { slug: 'cooling', name: 'Cooling', nameAr: 'التبريد', group: 'Core components', image: '/images/cat-cooling.png' },
  { slug: 'storage', name: 'Storage (SSD / HDD)', nameAr: 'التخزين (SSD / HDD)', group: 'Storage & power', image: '/images/cat-storage.png' },
  { slug: 'power-supplies', name: 'Power Supplies', nameAr: 'مصادر الطاقة (باور)', group: 'Storage & power', image: '/images/cat-power-supplies.png' },
  { slug: 'cases', name: 'PC Cases', nameAr: 'كيسات الكمبيوتر', group: 'Storage & power', image: '/images/cat-cases.png' },
  { slug: 'monitors', name: 'Monitors', nameAr: 'الشاشات', group: 'Peripherals', image: '/images/cat-monitors.png' },
  { slug: 'keyboards-mice', name: 'Keyboards & Mice', nameAr: 'الكيبورد والماوس', group: 'Peripherals', image: '/images/cat-keyboards-mice.png' },
  { slug: 'audio', name: 'Headsets & Audio', nameAr: 'سماعات وصوتيات', group: 'Peripherals', image: '/images/cat-audio.png' },
  { slug: 'networking', name: 'Networking', nameAr: 'الشبكات', group: 'Peripherals', image: '/images/cat-networking.png' },
]

export const CATEGORY_GROUPS: CategoryGroup[] = ['Laptops', 'Phones & Tablets', 'Core components', 'Storage & power', 'Peripherals']

const GROUP_AR: Record<CategoryGroup, string> = {
  Laptops: 'اللابتوبات',
  'Phones & Tablets': 'الموبايلات والتابلت',
  'Core components': 'المكونات الأساسية',
  'Storage & power': 'التخزين والطاقة',
  Peripherals: 'الملحقات',
}

export const CONDITIONS = [
  { value: 'new', label: 'New', labelAr: 'جديد' },
  { value: 'like-new', label: 'Like new', labelAr: 'كالجديد' },
  { value: 'used', label: 'Used', labelAr: 'مستعمل' },
  { value: 'for-parts', label: 'For parts', labelAr: 'للقطع' },
] as const

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function categoryName(category: Category | undefined, locale: Locale, fallback = '') {
  if (!category) return fallback
  return locale === 'ar' ? category.nameAr : category.name
}

export function groupName(group: CategoryGroup, locale: Locale) {
  return locale === 'ar' ? GROUP_AR[group] : group
}

export function conditionLabel(value: string, locale: Locale = 'en') {
  const c = CONDITIONS.find((c) => c.value === value)
  if (!c) return value
  return locale === 'ar' ? c.labelAr : c.label
}
