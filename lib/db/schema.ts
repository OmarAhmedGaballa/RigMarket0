import { pgTable, text, timestamp, boolean, serial, integer, customType } from 'drizzle-orm/pg-core'

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  // Seller verification. Private: only the admin ever sees these.
  phone: text('phone'),
  idImageId: text('idImageId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  brand: text('brand'),
  condition: text('condition').notNull().default('used'),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(1),
  imageUrl: text('imageUrl'),
  location: text('location'),
  // Legacy column. No longer collected and never shown to buyers.
  contactPhone: text('contactPhone'),
  status: text('status').notNull().default('pending'),
  adminNote: text('adminNote'),
  recommendedPrice: integer('recommendedPrice'),
  reviewedAt: timestamp('reviewedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

/** Uploaded photos (product photos are public, seller ID photos are admin-only). */
export const images = pgTable('images', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  kind: text('kind').notNull(), // 'listing' | 'id'
  mimeType: text('mimeType').notNull(),
  data: bytea('data').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameEn: text('nameEn').notNull(),
  nameAr: text('nameAr').notNull(),
  instructionsEn: text('instructionsEn').notNull().default(''),
  instructionsAr: text('instructionsAr').notNull().default(''),
  // Wallet number / IBAN customers should pay to. Set by the admin.
  accountDetails: text('accountDetails').notNull().default(''),
  requiresReference: boolean('requiresReference').notNull().default(false),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sortOrder').notNull().default(0),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  fullName: text('fullName').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  notes: text('notes'),
  paymentMethodCode: text('paymentMethodCode').notNull(),
  paymentMethodName: text('paymentMethodName').notNull(),
  paymentReference: text('paymentReference'),
  paymentStatus: text('paymentStatus').notNull().default('unpaid'), // unpaid | paid | refunded
  status: text('status').notNull().default('placed'), // placed | confirmed | shipped | delivered | cancelled
  total: integer('total').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('orderId')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  listingId: integer('listingId'),
  sellerId: text('sellerId'),
  title: text('title').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  imageUrl: text('imageUrl'),
})

export type Listing = typeof listings.$inferSelect
export type PublicListing = Omit<Listing, 'contactPhone'>
export type ListingStatus = 'pending' | 'approved' | 'declined'
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const
