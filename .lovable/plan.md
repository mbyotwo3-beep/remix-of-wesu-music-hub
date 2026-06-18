## Goal

Replace every piece of hardcoded music/album/artist/stats data with real data read from the database, and prepare the storage + payment slots so when you send the DPO Pay keys + design mockups we just plug them in.

## What's hardcoded today (will be removed)

| File | Hardcoded data |
|---|---|
| `src/routes/index.tsx` | `recentReleases`, `trending` arrays |
| `src/routes/browse.tsx` | mock song/genre lists |
| `src/routes/albums.tsx` | mock album grid |
| `src/routes/artists.index.tsx` | mock artist list |
| `src/routes/artists.$id.tsx` | mock artist profile + discography |
| `src/routes/dashboard.tsx` | mock user stats |
| `src/routes/artist-dashboard.tsx` | `revenueStats` mock |
| `src/routes/admin.tsx` | `stats`, `pendingApprovals` mock |
| `src/routes/subscriptions.tsx` | `freeFeatures`, `premiumFeatures` (kept — static plan copy) |
| `src/components/PlayerBar.tsx` | mock now-playing track |

Subscription **feature bullet lists** stay in code (marketing copy, not data). Subscription **plans, prices, MoMo providers** move to the DB.

## Backend work

### 1. Storage buckets
- `song-audio` (private — signed URLs only, premium gating)
- `album-art` (public)
- `artist-images` (public)
- `user-avatars` (public)

### 2. New tables
- `subscription_plans` — name, price_zmw, interval, features[], is_active
- `payment_methods` — code (mtn_momo, airtel, zamtel, visa, mastercard), label, logo_url, is_enabled
- `payment_transactions` — user_id, amount, currency, method, provider_ref (DPO token), status, item_type (song/album/subscription), item_id
- `platform_stats` view — counts for the admin dashboard
- `artist_revenue` view — per-artist sales/streams for the artist dashboard

### 3. Schema tweaks to existing tables
- `songs`: add `play_count`, `is_trending` (computed via cron later)
- `albums`: confirm `release_date`, add `featured` boolean for the homepage
- `artists`: add `verified`, `monthly_listeners`
- `profiles`: add `current_subscription_id`

### 4. RLS
- Public read on artists/albums/songs metadata (anon SELECT)
- Audio URLs: signed via server function — never expose storage path directly
- Purchases / transactions / subscriptions: user-owned only
- Admin views: gated by `has_role(uid, 'admin')`

### 5. Server functions (`src/lib/*.functions.ts`)
- `getFeaturedAlbums`, `getTrendingSongs`, `getNewReleases`
- `getArtistById`, `searchSongs`, `getAlbumWithSongs`
- `getMySubscription`, `getMyPurchases`, `getMyPlaylists`
- `getArtistRevenue` (artist-only), `getPlatformStats` (admin-only)
- `uploadSong` (artist upload portal — accepts file via signed-upload URL)
- `getSignedAudioUrl(songId)` — checks ownership/subscription before returning URL

### 6. Payment integration scaffolding (DPO Pay)
- `payment_methods` table seeded with MTN MoMo, Airtel Money, Zamtel, Visa, Mastercard
- Checkout page reads providers from DB
- Stub `initiatePayment` server function + `/api/public/dpo-webhook` route — both return "not configured" until you give me the DPO keys
- When you send the DPO sandbox keys, we add `DPO_COMPANY_TOKEN` + `DPO_SERVICE_TYPE` via the secret tool and fill in the bodies

## Frontend work

Each page becomes a thin shell over a server function loaded with TanStack Query:

```text
Route loader → ensureQueryData → server fn → DB
Component → useSuspenseQuery → render
```

Empty states render when DB tables are empty (no fake fallback). Skeleton loaders during fetch.

PlayerBar reads the currently-playing track from a Zustand store fed by user clicks — no mock track on first load.

## Order of execution

1. Migration: new tables, columns, RLS, views, storage buckets, seed payment_methods + 2 default subscription plans
2. Server functions for public reads (home, browse, artists, albums)
3. Wire public pages to those server functions; delete hardcoded arrays
4. Server functions for protected reads (dashboards, purchases)
5. Wire dashboards (user / artist / admin)
6. Artist upload portal → storage + DB insert
7. Checkout → DB-driven payment provider list + stub DPO call
8. **Pause here** — wait for you to send DPO Pay sandbox keys + design mockups/logo/splash
9. Plug DPO keys into `initiatePayment` + webhook, swap placeholder branding for your logo/splash

## What I need from you eventually

- DPO Pay **Company Token** and **Service Type** (sandbox first, prod later)
- Logo (PNG/SVG, transparent)
- Splash screen artwork (recommended 2732×2732 for Capacitor)
- App icon (1024×1024)
- Any mockup screenshots showing the design direction you want for the mobile app

You don't need to send these now — just whenever you have them.

## Out of scope for this pass

- DPO Pay actual API calls (stubbed until keys arrive)
- Mobile (Capacitor) screens — separate work, will branch on `usePlatform()`
- Background audio playback plugin (separate Capacitor task)

Reply **approve** to start with the migration, or tell me what to change.