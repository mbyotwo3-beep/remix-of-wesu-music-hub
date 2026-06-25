# Labels, Splits, Collaborations & Features

Building on the existing roles (superadmin / admin / artist / user), this plan adds **labels**, **revenue splits**, **collaborations**, and **featured artists** — and finishes every role's workflow end-to-end. DPO Pay stays stubbed; payouts and purchases still flow, just marked `pending` until keys arrive.

## 1. Database

New tables (all with GRANTs + RLS):

- **labels** — `id, name, slug, owner_user_id, bio, logo_url, contact_email, status (pending/approved/rejected), commission_pct (default 15), created_at`. Owner can edit; staff approves.
- **label_artists** — `label_id, artist_id, status (invited/active/left), royalty_pct (default 80), joined_at`. Unique `(label_id, artist_id)`.
- **song_collaborators** — `song_id, artist_id, role (main/featured/producer/writer), split_pct, accepted (bool default false)`. Sum of `split_pct` per song ≤ 100; trigger enforces.
- **song_credits_view** (SQL view) — denormalised credits for display.
- **featured_slots** — `id, slot_type (home_hero/home_artist/genre_top), target_type (song/album/artist/playlist), target_id, position, starts_at, ends_at, active`. Superadmin/admin manage.
- **invitations** — `id, kind (label_invite_artist/collab_invite/label_apply), from_user_id, to_user_id, to_email, payload jsonb, status (pending/accepted/declined), created_at`.
- **revenue_splits** (computed log) — `transaction_id, payee_user_id, payee_role (artist/label/platform/collaborator), amount, created_at`. Written by trigger on `payment_transactions` when status flips to `paid`.

Extend existing:

- `artists` → add `label_id` (nullable), `accepts_collabs` (bool), `available_for_features` (bool).
- `songs` → add `label_id` (cached from artist), `allow_collab_requests` (bool).
- `payouts` → add `period_start, period_end, gross_amount, platform_fee, label_fee, net_amount`.

Security-definer helpers:

- `is_label_owner(_uid, _label_id)`, `is_song_collaborator(_uid, _song_id)`, `artist_user_id(_artist_id)`.

Split trigger: on `payment_transactions.status = 'paid'`, compute splits — platform commission (from `platform_settings.commission_pct`), then label cut if song has `label_id`, remainder distributed across `song_collaborators.split_pct` (defaulting 100% main artist if none set). Insert one row per payee into `revenue_splits`.

## 2. Server functions

New `src/lib/labels.functions.ts`:

- `applyForLabel`, `updateLabel`, `listMyLabel`, `inviteArtistToLabel`, `respondToLabelInvite`, `setArtistRoyalty`, `removeArtistFromLabel`, `listLabelRoster`, `listLabelRevenue`, `requestLabelPayout`.

New `src/lib/collabs.functions.ts`:

- `inviteCollaborator(song_id, artist_id|email, role, split_pct)`, `respondToCollabInvite`, `listMyCollabInvites`, `listSongCollaborators`, `removeCollaborator`.

New `src/lib/features.functions.ts` (superadmin/admin):

- `listFeaturedSlots`, `upsertFeaturedSlot`, `removeFeaturedSlot`, `reorderSlots`.

Extend `artist.functions.ts`:

- `joinLabel`, `leaveLabel`, `setCollabPrefs`, `setFeatureAvailability`.

Extend `superadmin.functions.ts`:

- `moderateLabel(approve/reject)`, `setPlatformCommission`, `approvePayout`, `forcePayoutRecalc`.

Extend `admin.functions.ts`:

- `listLabels`, `listAllSplits`, `listFeatureRequests`.

Extend `listener.functions.ts`:

- `requestFeatureFromArtist` (fan-funded features: stub creates pending transaction + invitation).

All write functions append to `audit_log`.

## 3. Routes (all under `_authenticated/` for protected)

- `labels.index.tsx` (public) — browse labels.
- `labels.$slug.tsx` (public) — label page with roster + releases.
- `_authenticated/label-dashboard.tsx` — owner dashboard: roster, invites, revenue, payouts, settings.
- `_authenticated/apply-label.tsx` — create a label.
- `_authenticated/collabs.tsx` — incoming + outgoing collab invites.
- `_authenticated/artist-studio.tsx` → add tabs: **Collaborators**, **Label**, **Features**.
- `_authenticated/superadmin.tsx` → add tabs: **Labels**, **Featured slots**, **Commission**.
- `_authenticated/admin.tsx` → add **Labels moderation** tab.
- Home `index.tsx` reads from `featured_slots` instead of hardcoded "featured" booleans.

## 4. UI surfaces per role

**Listener**: sees collaborator credits on song rows; can request a feature from an artist (paid stub); browses labels.

**Artist**:

- Studio → Collaborators tab: invite by artist handle or email, set split %, accept/decline incoming, live total-split bar (must ≤ 100%).
- Studio → Label tab: apply to existing label / accept label invite / leave label / view royalty %.
- Studio → Features tab: toggle `available_for_features`, accept fan feature requests, set rate.
- Dashboard earnings now split into: streams, sales, features, collab share, label deductions.

**Label owner** (`/label-dashboard`):

- Overview: roster size, monthly revenue, pending invites.
- Roster: invite/remove artists, set per-artist royalty %, view per-artist revenue.
- Releases: all songs/albums under the label.
- Revenue: split breakdown table, period filter.
- Payouts: request label payout to MoMo/bank.

**Admin**: moderate labels (approve/reject), view all splits, see all collab invites.

**Superadmin**: everything admin sees + edit `platform_settings.commission_pct`, manage `featured_slots`, force split recalc, ban label.

## 5. Featured content pipeline

`home.featured` query reads `featured_slots` where `active = true AND now() between starts_at and ends_at`, ordered by `position`, joined to target table. Replaces current `albums.featured` / `songs.is_trending` direct flags (those stay but become inputs the superadmin can promote into slots).

## 6. Payments without DPO

`initiatePayment` stays a stub that writes `pending`. Add `markTransactionPaid(transaction_id)` superadmin-only function so the full split + payout pipeline can be tested today. Webhook at `/api/public/dpo-webhook` already wired — once keys land it flips status and the trigger fires automatically.

## 7. Order of work

1. Migration (tables, columns, helpers, split trigger, GRANTs, RLS).
2. Server fns: labels → collabs → features → extensions.
3. Label dashboard + apply flow + public label pages.
4. Artist Studio new tabs (Collaborators, Label, Features).
5. Collabs inbox route.
6. Superadmin/admin new tabs.
7. Home `featured_slots` rewrite.
8. Manual `markTransactionPaid` test → verify splits + payout math.

## Out of scope (still waiting)

- Real DPO Pay call in `initiatePayment` (need Company Token + Service Type).
- Branding swap (logo/splash/icon).
- Capacitor mobile-specific screens for these new flows.

Approve and I'll execute top to bottom in one pass, or say "stop after migration" to review the schema first.
