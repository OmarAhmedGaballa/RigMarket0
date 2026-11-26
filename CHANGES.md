# What changed

## Newest update  (run `pnpm db:migrate` first, then set the new variables in `.env.example`)

1. **Sellers can edit quantity / mark Sold out** (My ads > each ad). Quantity 0 = Sold out; set a number again to put it back.
2. **Admin announcement bar**: Admin > Settings > "Site announcement". Shows at the top of every page for 24 hours, then disappears by itself. Visitors can close it. Admin writes any text.
3. **Seller discounts** (live ads only). The new price must be LOWER than the current one (checked on the server, so it cannot be raised). Buyers see the old price crossed out + a % badge. "End discount" returns to the price the ad had before the discount, never above it. The commission is still added on top of the seller's new price.
4. **Seller can delete their ad**: this already existed (trash icon); it is now a clear "Delete" button with a confirmation.
5. **Primary admin**: the oldest admin account that exists when you run the migration becomes the primary admin. Only it can make other accounts admin (Admin > Accounts > open an account > Admin access) and can take it back. Admins it promotes cannot promote anyone, and cannot reset an admin's password. The primary admin cannot be changed.
6. **Email verification code**: new accounts get a 6-digit code by email (10 min, max 5 wrong tries, resend every 60s, 6 per hour). Unverified accounts cannot sign in; trying to sign in sends a new code. Existing accounts are marked verified by the migration so nobody is locked out. **Remember me** (checked by default): stay signed in 30 days; unchecked = signed out when the browser closes.
7. **Google + Facebook sign-in** (buttons show only when their keys are set). Same email = same account. Both are treated as already verified.
8. **Legal pages**: /privacy, /terms, /data-deletion (English + Arabic, with rigmarket0@gmail.com), linked from the footer and the sign-up form.

## Latest update
Run `pnpm db:migrate` again first (adds the commission setting and new columns; safe to repeat).

1. **Commission 1.5%**: the post-ad form shows "+1.5% commission" beside the price with a live preview. The seller types their own price; when the ad goes live (approved) the public price becomes price + commission. Sellers see their own price on My ads. Old ads keep their current price.
2. Removed the "Buy directly from the store" box from ad pages.
3. Every category now has its own product image (`public/images/cat-<slug>.png`). Replace any file with a photo of the same name to change it.
4. Light mode: darker, cooler page background so cards stand out.
5. **Admin** has new tabs: Accounts (every account: name, email, phone, ID photo, totals; click for full details, the account's ads, purchases and sales), Sales (every purchase with buyer, seller, seller share and commission + totals), Settings.
   - Passwords are stored as one-way hashes, so they cannot be shown. Admin can set a new password for any account instead.
5b. **Commission is editable** in Admin > Settings, with an option to re-price all live ads.
6. New categories: Mobile Phones, iPhone, Tablets, iPad (group "Phones & Tablets").

## Run these first
1. `pnpm install`
2. `pnpm db:migrate`   (needs DATABASE_URL; safe to run more than once. Adds the new tables/columns and the default payment methods)
3. `pnpm dev`

The first account that signs up is still the admin.

## Features
- **Cart**: Add to cart / Buy now on every ad; cart page; prices and stock are re-checked on the server.
- **Buy from the store**: checkout (name, phone, city, address) creates an order; stock is reduced, cancelling restocks. Buyers see `/orders`; admin manages `/admin/orders`.
- **Payments**: Admin > Payments. Edit name (EN/AR), instructions, wallet/account number, enable/disable, add/delete. Defaults: cash on delivery, Vodafone Cash, InstaPay (bank transfer is off). **Enter your real wallet numbers there.** No card gateway is connected.
- **Photo upload**: sellers upload a photo (compressed in the browser, validated on the server, stored in the database, served from `/api/images/...`).
- **Seller verification**: before the first ad a seller must give a mobile number + ID photo. ID photos are served only to admins (and the uploader).
- **Phone privacy**: buyers never receive any phone number; admin sees seller phone + ID on every ad and seller phone on each order item.
- **Admin controls**: edit every field of any ad, replace/remove photo, set status/stock, approve, decline with price suggestion, take down, delete.
- **Light / dark switch** in the header (follows the device by default).
- **Arabic + English** with full RTL. Language switch in the header; remembered in a cookie.
- **Customer service**: floating WhatsApp button + footer, number 01005784374, labelled WhatsApp-only. Change it in `lib/config.ts`.

## Notes
- Currency is set to EGP in `lib/config.ts` (`CURRENCY`). Existing ad prices keep their numbers.
- User-written text (ad titles/descriptions) is not machine-translated.
- Not tested in a running browser: build with `pnpm build` and click through once.
