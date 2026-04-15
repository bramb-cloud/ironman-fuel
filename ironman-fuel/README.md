# IronFuel

Your personal Ironman nutrition and training coach. Built for the road to September 2027.

## Features

- **Daily nutrition tracking** — breakfast, lunch, snack, dinner with per-ingredient sliders
- **Real product data** — Bürger Maultaschen, Barilla, Iglo, Oryza, ESN and more
- **Training day targets** — corrected kcal targets per session type (rest/strength/ride/run)
- **Macro bars** — visual protein/carbs/fat tracking vs daily targets
- **Water tracker** — tap to add, with Gilbert's disease safety in mind
- **Weight progress** — Monday weigh-in log with trend chart
- **Ironman readiness** — tracks your longest swim/bike/run vs race distances
- **50+ achievements** — lifetime badges, auto-unlocked from Strava
- **Strava auto-sync** — webhook receives new activities within seconds of finishing
- **Custom foods** — manual entry or barcode scanner (Open Food Facts database)
- **PWA** — installs as a home screen app on iPhone

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + real-time)
- **Vercel** (hosting + serverless functions)
- **Strava API** (OAuth + webhooks)
- **Open Food Facts** (barcode lookup)

## Environment Variables

Add these to Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
STRAVA_CLIENT_ID=212915
STRAVA_CLIENT_SECRET=your_secret
```

## Strava Webhook Setup

After deploying, register the webhook with Strava once:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=212915 \
  -d client_secret=YOUR_SECRET \
  -d callback_url=https://ironman-fuel.vercel.app/api/webhook \
  -d verify_token=ironman_fuel_webhook_2024
```

## Database

Run the SQL in `supabase-schema.sql` in the Supabase SQL editor to create all tables.

## Install as PWA (iPhone)

1. Open `ironman-fuel.vercel.app` in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap Add

## Ironman Goal

🔱 Full Ironman — September 7, 2027
