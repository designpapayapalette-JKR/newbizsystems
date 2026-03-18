# BizCRM — Setup Guide

## Prerequisites

- Node.js 18+ (`node -v`)
- npm or pnpm
- A [Supabase](https://supabase.com) account (free tier works)
- (Optional) PhonePe merchant account for online payments
- Vercel account for deployment

---

## Step 1 — Install Node.js (if needed)

```bash
# macOS — using Homebrew
brew install node

# Or install from https://nodejs.org
```

---

## Step 2 — Install dependencies

```bash
cd crm-saas
npm install
```

---

## Step 3 — Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon (public)` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Run the migration in Supabase SQL Editor:
   - Open **SQL Editor** → **New Query**
   - Paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run**
4. Create a Storage bucket named `invoices` (for PDF caching):
   - Go to **Storage** → **New Bucket** → Name: `invoices`, Private: ✓

---

## Step 4 — Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Generate VAPID keys for push notifications:
# npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT_EMAIL=your@email.com

CRON_SECRET=any-random-secret-string
```

---

## Step 5 — PhonePe Setup (optional)

1. Register at [PhonePe for Business](https://www.phonepe.com/business-solutions/)
2. Get your **Merchant ID**, **Salt Key**, and **Salt Key Index**
3. Add to `.env.local`:

```env
PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
PHONEPE_SALT_KEY=YOUR_SALT_KEY
PHONEPE_SALT_KEY_INDEX=1
# UAT (sandbox):
PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
# Production:
# PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
```

---

## Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 7 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set all environment variables in Vercel dashboard under **Settings → Environment Variables**.

The `vercel.json` file already configures the reminder cron job to run every 5 minutes.

---

## Architecture Overview

```
src/
├── app/
│   ├── (auth)/          Login, Signup, Forgot/Reset Password
│   ├── (app)/           Protected app shell
│   │   ├── dashboard/   KPI cards + pipeline chart + reminders
│   │   ├── leads/       Kanban + list, lead detail, activities
│   │   ├── reminders/   Reminder management + notifications
│   │   ├── payments/    Payment tracking + PhonePe
│   │   ├── invoices/    Invoice builder + PDF preview/download
│   │   └── settings/    Profile, org, team, pipeline, notifications
│   ├── api/
│   │   ├── auth/callback           Supabase OAuth
│   │   ├── phonepe/initiate        Create PhonePe order
│   │   ├── phonepe/status          Poll payment status
│   │   ├── webhooks/phonepe        PhonePe S2S webhook (HMAC verified)
│   │   ├── invoices/[id]/pdf       PDF generation (react-pdf)
│   │   └── reminders/check         Cron: send push notifications
│   └── onboarding/      Create org + pipeline setup
├── actions/             Next.js Server Actions (all mutations)
├── components/          UI components by feature
├── lib/supabase/        Browser + server clients
└── lib/phonepe/         PhonePe checksum + API client
```

## Key Features

| Feature | How it works |
|---|---|
| **WhatsApp** | `wa.me/{phone}?text=...` deep link — opens WhatsApp on any device |
| **Call** | `tel:{phone}` link — opens native dialer on mobile |
| **Email** | `mailto:{email}?subject=...` — opens default email client |
| **SMS** | `sms:{phone}?body=...` — opens native SMS app |
| **PhonePe** | Redirect-based PG → HMAC-verified webhook updates DB |
| **PDF Invoice** | `@react-pdf/renderer` server-side → streams PDF binary |
| **Push Notifications** | Service Worker + Web Push API + Vercel Cron |
| **Kanban** | `@dnd-kit` drag-drop → server action updates stage + position |
| **RLS** | Every table is org-scoped via Supabase Row Level Security |

## Verification Checklist

- [ ] Sign up → verify email → onboarding → dashboard
- [ ] Create lead → appears in Kanban; drag to another stage
- [ ] Log activity → shows in timeline
- [ ] Create reminder → enable notifications → receive browser alert
- [ ] Tap WhatsApp on mobile → opens WhatsApp DM
- [ ] Tap Call → phone dialer opens
- [ ] Create invoice → download PDF → correct data
- [ ] PhonePe UAT: initiate payment → complete → status updates to "paid"
- [ ] Invite team member → accept → member can see org data
- [ ] Open on mobile 375px → all pages responsive
