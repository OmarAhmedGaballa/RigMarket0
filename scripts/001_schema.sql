-- Idempotent: safe to run on a fresh database AND on an existing RigMarket database.

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "role" text NOT NULL DEFAULT 'user',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "idImageId" text;

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "listings" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "brand" text,
  "condition" text NOT NULL DEFAULT 'used',
  "price" integer NOT NULL,
  "imageUrl" text,
  "location" text,
  "contactPhone" text,
  "status" text NOT NULL DEFAULT 'pending',
  "adminNote" text,
  "recommendedPrice" integer,
  "reviewedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "stock" integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS "images" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "kind" text NOT NULL,
  "mimeType" text NOT NULL,
  "data" bytea NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payment_methods" (
  "id" serial PRIMARY KEY,
  "code" text NOT NULL UNIQUE,
  "nameEn" text NOT NULL,
  "nameAr" text NOT NULL,
  "instructionsEn" text NOT NULL DEFAULT '',
  "instructionsAr" text NOT NULL DEFAULT '',
  "accountDetails" text NOT NULL DEFAULT '',
  "requiresReference" boolean NOT NULL DEFAULT false,
  "enabled" boolean NOT NULL DEFAULT true,
  "sortOrder" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "fullName" text NOT NULL,
  "phone" text NOT NULL,
  "city" text NOT NULL,
  "address" text NOT NULL,
  "notes" text,
  "paymentMethodCode" text NOT NULL,
  "paymentMethodName" text NOT NULL,
  "paymentReference" text,
  "paymentStatus" text NOT NULL DEFAULT 'unpaid',
  "status" text NOT NULL DEFAULT 'placed',
  "total" integer NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" serial PRIMARY KEY,
  "orderId" integer NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "listingId" integer,
  "sellerId" text,
  "title" text NOT NULL,
  "price" integer NOT NULL,
  "quantity" integer NOT NULL,
  "imageUrl" text
);

CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" ("userId");
CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" ("orderId");
CREATE INDEX IF NOT EXISTS "listings_status_idx" ON "listings" ("status");

-- Default payment methods. The admin edits/enables/disables these in Admin > Payments.
-- Account details are intentionally empty: the admin must enter the real wallet / account numbers.
INSERT INTO "payment_methods" ("code","nameEn","nameAr","instructionsEn","instructionsAr","requiresReference","enabled","sortOrder") VALUES
 ('cod','Cash on delivery','الدفع عند الاستلام','Pay in cash when your order arrives.','ادفع نقدًا عند وصول طلبك.',false,true,1),
 ('vodafone-cash','Vodafone Cash','فودافون كاش','Send the order total to the wallet shown below, then enter the transaction reference.','حوّل إجمالي الطلب إلى المحفظة الموضحة أدناه، ثم اكتب رقم العملية المرجعي.',true,true,2),
 ('instapay','InstaPay','إنستا باي','Send the order total to the InstaPay address shown below, then enter the transaction reference.','حوّل إجمالي الطلب إلى عنوان إنستا باي الموضح أدناه، ثم اكتب رقم العملية المرجعي.',true,true,3),
 ('bank-transfer','Bank transfer','تحويل بنكي','Transfer the order total to the bank account shown below, then enter the transfer reference.','حوّل إجمالي الطلب إلى الحساب البنكي الموضح أدناه، ثم اكتب رقم التحويل المرجعي.',true,false,4)
ON CONFLICT ("code") DO NOTHING;
