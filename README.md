# VNTG DENIM

VNTG DENIM is a premium raw and selvedge denim preorder store. The project is being built in deliberate phases, with security and data integrity ahead of payment or launch features.

## Current phase

**Phase 6 — Secure admin dashboard** is complete as an unconnected Supabase-backed implementation.

- A Next.js 16, TypeScript, React, and Tailwind CSS application is initialized.
- The public home page establishes the black-and-white VNTG visual system.
- `/admin` is an unconnected dashboard shell. It is not an admin system and must not contain real data until authentication, authorization, and database policies are in place.
- No external accounts, databases, payment providers, SMS services, or deployments are configured.

**Phase 3 — Storefront catalogue** now includes four fit collections (Baggy Fit, Straight Fit, Wide Leg, and Bootcut) with fit-specific concept imagery, filtered collection routes, and matching sample product-detail routes. The fit images are AI-generated design studies, not real VNTG product photography; they must be replaced with licensed product images before launch.

**Phase 4 — Cart and demonstration checkout** adds size-required Add to Bag and Buy Now actions, a persistent browser-only cart, quantity controls, subtotal calculations, and a responsive shipping-details form. Checkout validates form fields locally but never creates an order, takes payment, sends OTPs, or stores customer details. The cart data shape is deliberately separated from the product catalogue so a future server-side cart, database, inventory validation, and payment provider can replace it safely.

**Phase 5 — Backend and database foundation** adds a Supabase PostgreSQL migration, typed public-key clients, optional Supabase Auth helpers, an optional account screen, and a server route prepared for trusted pending-order creation. The current storefront remains a demonstration until the owner applies the migration and supplies public Supabase configuration. No Supabase project, storage bucket, payment, OTP, deployment, or external account was created by this project.

**Phase 6 — Secure admin dashboard** adds server-checked `/admin` access, protected product and order APIs, a responsive operations UI, product drafts/publication/archiving, size availability, and safe fulfilment transitions. An administrator cannot set an order to paid: payment status remains reserved for a future verified payment webhook.

## Run locally

1. Install the current Node.js LTS release, which includes `npm` and `npx`.
2. In this directory, run:

   ```powershell
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000`.

Create `.env.local` from `.env.example` only when a later phase requires a service. Never put real secrets in `.env.example` or commit `.env.local`.

## Checks

```powershell
npm run lint
npm test
npm run build
```

`npm run build` is the release-quality check currently used by this project: it compiles the application and runs TypeScript validation. See the current phase handoff for any dependency-level lint issue.

## Supabase setup (manual, free tier)

1. Create a free Supabase project yourself and copy its project URL and **publishable key** into `.env.local` using `.env.example`. The app also accepts the older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name for existing projects.
2. Review and apply [the Phase 5 migration](supabase/migrations/202610120001_phase5_foundation.sql) using the Supabase SQL editor or CLI.
3. In Supabase Auth, enable the desired email sign-in and confirmation settings. Supabase Auth stores passwords; this app does not.
4. Promote administrators only by changing a trusted profile row in the Supabase dashboard. Never expose a service-role key to the browser or commit it to the repository.
5. Apply [the Phase 6 migration](supabase/migrations/202610130001_phase6_admin.sql). It adds draft/published states, homepage settings, featured products, fulfilment fields, and stricter public product policies.

To grant the first administrator, use the Supabase SQL editor as the project owner after that person has registered: `update public.profiles set role = 'admin' where id = '<auth user UUID>';`. Never add this capability to public registration or browser code.

The `create_pending_order` database function always calculates prices from product rows, validates selected sizes, snapshots ordered product data, and starts orders as `pending_payment`. It cannot mark an order paid. A future approved payment integration must independently verify provider webhooks before changing an order status.

## Planned architecture

- `src/app` — storefront, account, admin, and future API routes
- `src/components/storefront` — shared public header and footer
- `src/features` — domain modules such as catalogue, cart, checkout, orders, and payments (added as each phase requires them)
- `supabase/migrations` — future database migrations and Row Level Security policies
- `tests` — future unit, integration, and browser tests

## Safety rules

- Prices, inventory, identities, roles, and payment outcomes will be validated on the server.
- Customer and order data will be protected through authentication, role checks, and Supabase Row Level Security.
- Live SMS OTP and payment processing will not be enabled without the owner’s explicit approval and real provider configuration.
- The project will not claim a payment is successful unless trusted provider verification confirms it.

## Next phase

Integrate a reviewed payment provider and verified server-side webhooks only after privacy, fulfillment, payment, and abuse-prevention requirements are approved. Do not treat the current demo checkout as live ordering.
