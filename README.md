# Kollel Chatzos · נקודת חצות

Bilingual marketing site + lightweight backend for **Kollel Chatzos — Nekudas Chatzos**.

**Live:** [kollel-chatzos.vercel.app](https://kollel-chatzos.vercel.app/)

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | Static HTML, CSS, vanilla JS |
| Hosting | Vercel (static + serverless `/api/*`) |
| Database | [Supabase](https://supabase.com) (Postgres) |
| Email | [Resend](https://resend.com) — optional, add later |

## Features

- **Dedication modal** — name + occasion saved *before* redirect to FirstAccept
- **Partner & mailing forms** → Supabase (email via Resend when configured)
- **Chatzos clock** — tonight’s chatzos & alos for Brooklyn (Hebcal zmanim)
- **OG tags** — rich previews when shared on WhatsApp / iMessage
- **FAQ** on Partner page
- EN / Yiddish toggle with RTL

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql)
3. Copy **Project URL** and **service_role** key (Settings → API)

### 2. Vercel environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only — never expose in browser |
| `RESEND_API_KEY` | No | Add when ready for email |
| `EMAIL_FROM` | No | Verified sender in Resend |
| `PARTNER_INBOX_EMAIL` | No | Defaults with Resend |
| `MAILING_INBOX_EMAIL` | No | Defaults with Resend |

Redeploy after adding variables.

### 3. Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npx vercel dev                 # static pages + /api routes
```

Plain static preview (no API):

```bash
python -m http.server 8000
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dedication` | POST | Save donate dedication → Supabase |
| `/api/partner` | POST | Partner form → Supabase (+ Resend if set) |
| `/api/mailing` | POST | Mailing signup → Supabase (+ Resend if set) |
| `/api/zmanim` | GET | Tonight’s chatzos / alos (Brooklyn) |

## Database tables

- `dedications` — pre-payment name / occasion / amount
- `partner_inquiries` — contact form
- `mailing_subscribers` — email list

View data in Supabase **Table Editor** until an admin UI is built.

## Deploy

```bash
git push origin main
```

Vercel runs `npm install` for API dependencies automatically.

## Roadmap

- Admin page to browse dedications
- Resend for hanhalah notifications + welcome emails
- Custom domain + update `og:url` / sitemap URLs
- Matbia / Pledger deep links
