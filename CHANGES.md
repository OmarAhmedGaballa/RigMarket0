# What changed

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
