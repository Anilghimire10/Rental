# GharBhada — Mediated Property Rental Marketplace (Pokhara)

A production-ready, full-stack rental marketplace for **Pokhara, Nepal**, built with
**Next.js (App Router) + Supabase**. GharBhada acts as an **agency / mediator**: renters
never see an owner's contact details or a property's exact coordinates. All contact runs
through the platform, and an admin connects tenants and owners.

- **Free for everyone** in v1 — no online payments, no listing/subscription fees.
- Architected with clean seams so **paid plans, featured listings, ads, and payments**
  can be added later without a rewrite (`plan` on users, `isFeatured` on listings,
  `advertisements` table, channel-agnostic `notificationService`).

---

## ✨ Features

**Tenants** — browse/search (list + map), filter by area/category/price/amenities, save
favorites, send inquiries, request visits, track their inquiries & visits. Email/password
+ Google sign-in with email verification.

**Owners** — list properties (multi-image upload, all fields), edit/delete, mark
rented/available, see **inquiry & visit counts only** (never tenant contact). Listings are
**pending until an admin approves**.

**Admin** (separate `/admin` layout, role-gated 403) — analytics overview, property
moderation (approve/reject/feature/delete), **inquiry hub** and **visit hub** showing
tenant contact **and** matched owner contact, user management (roles/plans/ban),
category management, advertisement management.

**SEO** — SEO-friendly URLs (`/property/pkr-123-room-lakeside`), per-listing metadata +
Open Graph, JSON-LD, dynamic `sitemap.xml`, `robots.txt`, server-rendered listing pages.

---

## 🏗️ Architecture & security model

- **Single Next.js project.** No separate backend. All sensitive logic runs server-side
  in Server Actions / Route Handlers, organized into a clean **`lib/services/`** layer so
  it could be lifted into a standalone API later. UI components contain no DB/auth logic.
- **The invariant:** *if all UI were removed, no user could call any endpoint and receive
  data they aren't authorized to see.* Enforced in three layers:
  1. **Supabase RLS** — row-level access at the database (`supabase/rls.sql`).
  2. **Server auth guards** — `requireUser / requireRole / requireAdmin / requireVerified`
     at the top of every service entry point (`lib/auth/session.ts`).
  3. **DTO serializers** — column-level privacy (`lib/dto/*`). Public DTOs never emit
     owner contact or exact lat/lng; coordinates are **jittered** to an approximate circle.
- **Service-role key** (`lib/supabase/admin.ts`) is `server-only` and used ONLY inside
  `requireAdmin()`-guarded paths and for owner **aggregate counts** (never owner-visible
  rows).

```
app/
  (site)/        public + tenant + owner pages (shared header/footer)
  admin/         separate, data-dense admin dashboard (role-gated)
  auth/          login / signup / verify / forgot / reset / callback
  api/upload/    server-validated image upload
lib/
  services/      listing, inquiry, visit, favorite, user, category, advertisement,
                 analytics, storage, notification
  actions/       "use server" entry points (validated, rate-limited)
  dto/           private-field serializers
  validation/    Zod schemas
  supabase/      browser / server / admin / middleware clients
  auth/          session + RBAC guards
supabase/        schema.sql · rls.sql · storage.sql · seed.ts
```

---

## 🔧 Tech stack

Next.js 14 · React 18 · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres, Auth,
Storage, RLS) · Mapbox GL (approximate maps) · Resend (email) · Zod · react-hook-form.

---

## 🚀 Local setup

### 1. Prerequisites
- Node 18+ and npm
- A free [Supabase](https://supabase.com) project
- (Optional) [Mapbox](https://mapbox.com) token + [Resend](https://resend.com) API key

### 2. Install
```bash
npm install
cp .env.example .env.local   # then fill in values
```

### 3. Configure the database
In the Supabase Dashboard → **SQL Editor**, run these files **in order**:
1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/storage.sql`

### 4. Configure Auth
- **Authentication → Providers → Email**: enable, with "Confirm email" ON.
- **Authentication → Providers → Google**: enable and add your OAuth credentials.
- **Authentication → URL Configuration**: set Site URL to `http://localhost:3000` and add
  `http://localhost:3000/auth/callback` to the redirect allow-list.

### 5. Seed sample data (admin, owners, listings, categories)
```bash
npm run seed
```
Creates an admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`), two owners, a tenant,
all categories, and ~10 approved Pokhara listings with placeholder photos.

### 6. Run
```bash
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

**Seeded logins** (password set in `.env.local` for admin; others below):
| Role   | Email                     | Password         |
|--------|---------------------------|------------------|
| Admin  | `SEED_ADMIN_EMAIL`        | `SEED_ADMIN_PASSWORD` |
| Owner  | `owner1@gharbhada.test`   | `Owner!Pass123`  |
| Tenant | `tenant@gharbhada.test`   | `Tenant!Pass123` |

---

## 🔑 Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Admin/mediator ops + seed |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirects + email links |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Maps (app degrades gracefully without it) |
| `NEXT_PUBLIC_AGENCY_PHONE` / `_WHATSAPP` / `_EMAIL` | Public agency contact |
| `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_NOTIFICATION_EMAIL` | Email notifications |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | First admin (seed) |

---

## ☁️ Deploy (Vercel + Supabase)

1. Push to GitHub and import the repo into **Vercel**.
2. Add all `.env.local` variables to the Vercel project (set `NEXT_PUBLIC_SITE_URL` to your
   production URL).
3. In Supabase **Auth → URL Configuration**, add `https://your-domain/auth/callback` to the
   redirect allow-list and set the Site URL.
4. Restrict your Mapbox token to your production domain.
5. Verify your sending domain in Resend and set `EMAIL_FROM` accordingly.
6. Deploy. Run the SQL files + `npm run seed` against the production project if needed.

---

## 🔐 Security checklist (implemented)

- Passwords hashed by Supabase Auth (never stored in app tables)
- RBAC on every server action/route; `/admin` returns 403 to non-admins
- Owners can edit/delete only their own listings (server-enforced + RLS)
- All inputs validated/sanitized with Zod server-side
- Private fields never serialized to non-admins (explicit DTOs) + jittered coordinates
- Supabase RLS on every table; service-role key is `server-only`
- Rate limiting on auth, inquiry, and visit endpoints
- HTTP-only secure cookies (Supabase SSR), CSRF-safe Server Actions
- Security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.mjs`
- Image-upload validation (mime allowlist, 5 MB cap, sanitized filenames, own-folder RLS)
- Email verification required before posting listings
- Honeypot fields on signup, inquiry, and visit forms

---

## 🧭 Future monetization seams (not built in v1)

- `plan` on users + `advertisements` table already exist.
- `isFeatured` on listings + admin feature/unfeature control already exist.
- `notificationService` is channel-agnostic — add WhatsApp Business API alerts by
  extending each function (see `// FUTURE: WhatsApp` markers) with no call-site changes.
- The inquiry/visit workflow leaves room to attach a payment step later.

> **App name:** the brand is set in `lib/config.ts` (`BRAND`). Change it once there to
> rebrand (e.g. to "RentEase Pokhara").
