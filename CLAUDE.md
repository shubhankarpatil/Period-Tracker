# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Next.js 16 (App Router) period-tracking PWA backed by Supabase. Deployed at https://period-tracker-gamma.vercel.app/. Despite the directory name `void-tyson`, the package and product are "Period Tracker".

## Commands

- `npm run dev` — start Next dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm test` — run Vitest. Watches by default in a TTY; CI runs once. Pass `-- --run` to force one-shot locally.
- No lint script. For type checking, run `npx tsc --noEmit` directly.

CI runs `npm test` on push and PR via `.github/workflows/test.yml`.

## Required environment (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used by the browser client at `lib/supabase.ts`
- `RESEND_API_KEY` — server-only, used by both `app/api/notify/route.ts` and `app/api/send-update/route.ts`

## Architecture

### Single-page client app
`app/page.tsx` is the only real route for authed users. It owns the Supabase session and swaps between `<AuthForm />` and `<Dashboard />`. The dashboard is a single ~111KB component (`app/components/Dashboard.tsx`) that contains essentially the entire product surface: calendar logging, phase prediction, charts (recharts), PDF export (jspdf), partner sharing, supplies/checklist, notifications, and the knowledge hub view. Tabs (`home | graph | knowledge | profile`) are local state inside Dashboard, not separate routes — `BottomNav` just flips that state.

### Auth and routing
- Session is read client-side via `supabase.auth.getSession()` and `onAuthStateChange`; there is no server-side auth or middleware.
- `app/auth/callback/page.tsx` handles Supabase's email-link redirects (sign-in confirmation and password recovery). Recovery is detected by appending `?type=recovery` to the home URL, which `AuthForm` reads via `useSearchParams`.
- `@/*` path alias maps to the project root (see `tsconfig.json`).

### Partner share — public read/write surface
`app/partner/[token]/page.tsx` renders a public, unauthenticated view keyed off `profiles.partner_token`. The browser anon client queries `profiles`, `cycles`, and `supplies` directly. The RLS policies in `supabase/supplies_rls.sql` deliberately allow `anon` to read and update any `supplies` row whose owner has a non-null `partner_token`. The SQL file itself notes this is too coarse for production. Treat `partner_token` as a bearer secret in URLs and avoid making it more permissive.

### Cycle phase logic
The phase + cycle-day calculation lives in `lib/cyclePhase.ts` (pure, tested in `lib/cyclePhase.test.ts`). Both `Dashboard.tsx` and `app/partner/[token]/page.tsx` call `calculatePhase(cycles, target)` — don't reintroduce a local copy.

Current rule, counted from the most recent past cycle's `start_date` (day 1 = the start date itself):
`<=5 Menstrual`, `<=14 Follicular`, `<=21 Ovulatory`, otherwise `Luteal`. Change the thresholds in `cyclePhase.ts` only; tests cover each boundary.

### Data model (`supabase/`)
- `profiles` — `id`, `email`, `partner_email`, `partner_token`, `name`. Names/tokens are added in later migrations rather than `schema.sql`.
- `cycles` — period start/end plus `symptoms` (jsonb array) and `mood`.
- `daily_logs` — one row per `(user_id, date)`, with mood, symptoms, and Health-IQ columns (`basal_temp`, `cervical_mucus`, `lh_test`) added by `add_health_iq_columns.sql`.
- `supplies` — partner-support checklist; the only table with permissive `anon` policies.

`schema.sql` is the original schema and is **not** the current truth — `add_health_iq_columns.sql`, `supplies_rls.sql`, and `fix_permissions.sql` are incremental migrations applied on top. When changing the schema, add a new SQL file rather than rewriting `schema.sql`.

### Email and the Edge Function
- `app/api/notify/route.ts` sends phase-change notifications to a partner via Resend.
- `app/api/send-update/route.ts` is a more generic Resend send endpoint.
- `supabase/functions/check-cycles/index.ts` is a stubbed Deno edge function (returns a mock response). It's not deployed/wired up — don't assume the cron path works.

### PWA
`app/layout.tsx` injects an inline script that registers `public/sw.js`. The service worker is a no-op pass-through that exists only to satisfy installability. `public/manifest.json` provides the install metadata. The `viewport` export sets `viewportFit: 'cover'` so `env(safe-area-inset-*)` resolves to non-zero on devices with system-UI overlap; the bottom nav uses `env(safe-area-inset-bottom)` so icons clear the iOS toolbar / Android gesture bar.

## Conventions worth knowing

- All meaningful UI components are client components (`'use client'`). Server components are not used beyond `layout.tsx`.
- Dates from Supabase (`YYYY-MM-DD` strings) must use `parseLocalDate` / `formatLocalDate` from `lib/cyclePhase.ts` (or the equivalent split-and-construct pattern). Plain `new Date('YYYY-MM-DD')` parses as UTC and shifts by the user's offset — banned.
- Local notification deduplication uses `localStorage` keys `lastNotifiedPhase` and `lastRemindedDate`.
- The `supabase/` directory is excluded from `tsconfig.json` because the edge function is Deno, not Node.

### Responsive layout
- Two breakpoint systems coexist at **900px** and must stay in sync: a JS `isDesktop` flag at `Dashboard.tsx:226` (set via `window.innerWidth >= 900` on resize) and CSS `@media (min-width: 900px)` / `@media (max-width: 899px)` rules in the CSS modules. If you bump one, bump both.
- `Dashboard.tsx` is dominated by inline styles (~175 `style={{...}}` blocks). Many branch on `isDesktop`. Prefer the CSS-module + `@media` route for new responsive rules — only use the JS flag when you need a different markup tree (not just sizes/spacing). The `isDesktop` default is `false`, which can cause a brief mobile layout flash on hydration for desktop users; keep this in mind when adding more JS-flag logic.

### Modal pattern
The Day Detail modal (`Dashboard.tsx`) and the KnowledgeHub deep-dive modal use the same structure: an `inset: 0` backdrop overlay plus a `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)` modal box (do **not** rely on flex-centering the box from the overlay — it broke when ancestor transforms appeared). Both modals use `padding: '0 <horizontal>'` on the box and put top/bottom padding on the sticky header and footer respectively, with `marginLeft/Right: -<horizontal>` + `paddingLeft/Right: <horizontal>` on those bars to extend full-width. Border radius is 8px on the box, 6px on action buttons. Mobile `maxHeight` is gated on `isDesktop` (passed as a prop to `KnowledgeHub`).

### Partner Support Checklist
Suggestions are static per phase in `PHASE_TASKS` (`Dashboard.tsx`). The Refresh button calls `suggestTasksForPhase`, which **deletes all rows whose `item` matches any string in `PHASE_TASKS` (across phases)** and re-inserts the current phase's set. The heuristic identifies AI-suggested tasks by exact text match — if you change a `PHASE_TASKS` string, existing rows with the old string become orphaned (they survive Refresh as if user-added). Long-term cleaner solution would be an `is_suggested` boolean column on `supplies`.
