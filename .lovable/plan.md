# Light/Dark Mode + Full Role Workflows

## 1. Theming (light + dark)

- Add light-mode token values to `src/styles.css` `:root` (currently `:root` and `.dark` are identical — both dark).
- Move the current dark palette into `.dark` only; design a true light palette for `:root` (warm off-white bg, deep ink foreground, same gold primary).
- Add a `ThemeProvider` (`src/hooks/use-theme.tsx`) that:
  - Reads `localStorage('wesu-theme')` → `'light' | 'dark' | 'system'` (default `system`).
  - Toggles `.dark` class on `<html>`.
  - Listens to `prefers-color-scheme` when `system`.
- Add a `ThemeToggle` icon-button in `Navbar` (sun/moon).
- Mount provider in `__root.tsx` and add a small inline script in `<head>` to set the class before hydration (avoid flash).

## 2. Roles

Add a 4th role `superadmin` on top of existing `admin / artist / user`. Superadmin can do everything admin can, plus manage admins and platform config.

DB migration:
- Extend `app_role` enum with `superadmin`.
- Add helper `is_admin_or_super(uid)` security-definer fn.
- Update existing admin RLS policies to accept both roles.
- New table `platform_settings` (singleton key/value) — superadmin-only writes.
- New table `audit_log` (actor_id, action, target_type, target_id, meta jsonb) — admin+ read, system insert.
- Seed: first user with email matching `SUPERADMIN_EMAIL` env (or manual grant flow).

## 3. Workflows by role

### Superadmin (`/superadmin`)
- Dashboard: platform stats (already exists) + revenue chart, MRR, churn.
- **Manage admins**: list users, grant/revoke `admin` and `artist` roles, ban user.
- **Manage subscription plans**: CRUD on `subscription_plans` (name, price, features, active).
- **Manage payment methods**: toggle MTN/Airtel/Zamtel/Visa active, set fees.
- **Platform settings**: site name, support email, DPO mode (sandbox/live), commission %.
- **Audit log** viewer with filters.

### Admin (`/admin` — already partially built)
- Existing stats + recent activity stays.
- Add: moderate songs (approve/reject/take down), moderate artists (verify badge), view all transactions with refund action, view all users (read-only).

### Artist (`/artist-dashboard` — already partially built)
- Existing overview stays.
- Add: **Upload song** (audio file → `song-audio` bucket, cover → `album-art`, set title/price/album/genre).
- **Create album** form.
- **Edit artist profile** (bio, image → `artist-images`, social links).
- **Withdraw earnings** request (creates payout row, pending superadmin approval).
- "Become an artist" application flow at `/become-artist` for logged-in users → creates pending `artists` row → admin approves.

### Listener / User (`/dashboard` — already partially built)
- Existing overview stays.
- Add: **Create/edit playlist**, add songs to playlist, like/unlike song.
- **Manage subscription** (upgrade/cancel) → goes to `/checkout`.
- **Purchase history** with re-download links (signed URLs).
- **Profile editor** (avatar upload → `user-avatars`, display name).

### Public (no auth)
- Browse, search, artist pages stay. Add "Sign in to play full track / purchase / subscribe" CTAs.

## 4. New routes

```
src/routes/
  _authenticated/
    superadmin.tsx
    superadmin.users.tsx
    superadmin.plans.tsx
    superadmin.payments.tsx
    superadmin.settings.tsx
    superadmin.audit.tsx
    artist-dashboard.upload.tsx
    artist-dashboard.albums.new.tsx
    artist-dashboard.profile.tsx
    artist-dashboard.payouts.tsx
    dashboard.playlists.$id.tsx
    dashboard.profile.tsx
    dashboard.purchases.tsx
    become-artist.tsx
```
(Existing top-level `admin.tsx`, `artist-dashboard.tsx`, `dashboard.tsx` get moved under `_authenticated/` so the integration gate protects them.)

## 5. Server functions (new files)

- `src/lib/superadmin.functions.ts` — `listUsers`, `grantRole`, `revokeRole`, `upsertPlan`, `togglePaymentMethod`, `updateSettings`, `listAudit`, `approvePayout`.
- `src/lib/admin.functions.ts` — extend with `moderateSong`, `verifyArtist`, `refundTransaction`.
- `src/lib/artist.functions.ts` — `uploadSong`, `createAlbum`, `updateArtistProfile`, `requestPayout`, `applyAsArtist`.
- `src/lib/listener.functions.ts` — `createPlaylist`, `addToPlaylist`, `likeSong`, `updateProfile`, `signedAudioUrl`.

All write fns insert into `audit_log`.

## 6. Order of work

1. Migration (enum + tables + policies).
2. Theme tokens + ThemeProvider + toggle.
3. Move protected routes under `_authenticated/`, add role-guards in their loaders.
4. Superadmin section (full).
5. Admin moderation additions.
6. Artist upload + profile + payouts.
7. Listener playlists + profile + purchases.
8. "Become an artist" + role grant.

## Out of scope (still waiting on you)
- Actual DPO Pay API calls — stubs remain until you send keys.
- Mobile (Capacitor) screens — separate pass.
- Branding swap (logo/splash/icon) — separate pass when you send assets.

Want me to proceed with all of this in one go, or stop after the migration + theming for review?
