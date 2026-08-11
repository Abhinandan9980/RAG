# AuraSQL (Keystone SQL) Click Reduction — Design

## Context

The user flagged AuraSQL specifically as needing "a major change in format — too many clicks involved." A parallel-agent survey of `frontend/app/aurasql/**` confirmed the bottleneck: first-time setup (no saved connection) takes 5 clicks across 3 full-page navigations — `/aurasql/query` → empty-state "Create connection" → full-page `/aurasql/connections/new` form → auto-navigate to full-page `/aurasql/contexts/new` → auto-navigate back to `/aurasql/query` — before a user can ask a single question.

Reading `app/aurasql/query/page.tsx` directly (not just the survey) showed the bottleneck is narrower than it first looked: the query page **already** has a working in-canvas pattern for context/table selection — a `Schema` button opens an `Inspector` drawer (lines 870–897) where a user checks tables and saves a context via `ContextNameDialog`, all without leaving `/aurasql/query`. Only **connection creation** lacks an in-canvas equivalent and forces the two extra page hops.

Confirmed with the user:

| Decision | Answer |
|---|---|
| Scope | In-canvas connection creation, persisted last-used connection/context, working History → resume, dedupe redundant buttons, and fully wire up Settings. |
| Settings page (currently decorative — state never persisted or read) | Wire it up for real, not remove it. |
| Connections/Contexts list pages (`/aurasql/connections`, `/aurasql/contexts`) | Unchanged — they're for managing/editing existing records, not part of the click bottleneck. |

## Part 1 — In-canvas connection creation

- New `CreateConnectionDrawer` (or reuse `Inspector` in a second mode) rendered from `app/aurasql/query/page.tsx`, holding the same fields as `app/aurasql/connections/new/page.tsx`'s form (reuse that page's field list/validation logic — extract into a shared form component both the drawer and the existing full page render, rather than duplicating field markup).
- The empty-state's `Create connection` button (`query/page.tsx:804`, `router.push('/aurasql/connections/new')`) opens this drawer in place instead of navigating away.
- On successful save: refresh `connections` state, auto-select the new connection (mirroring today's `handleFetchTables`/`selectedConnection` flow), and open the Schema drawer directly so the user lands on table selection — collapsing what's today "3 pages" into "1 page, 2 in-canvas steps."
- `app/aurasql/connections/new/page.tsx` keeps existing as a direct-URL entry point (useful for editing existing connections' page still exists at `/aurasql/connections/[id]`) but the query-page empty-state no longer routes there.

## Part 2 — Persist last-used connection + context

- On successful connection/context selection (and on the auto-select-first-connection path, `query/page.tsx:236-238`), write `{ connectionId, contextId }` to `localStorage` (new small module, e.g. `lib/aurasql/lastUsed.ts`, mirroring the existing `hooks/useSidebarExpanded.ts` persisted-preference pattern).
- On load (`query/page.tsx`'s existing `load()` effect, lines 212–255), check the stored value **after** checking URL params (`context`/`connection`/`session` — those stay authoritative, e.g. from a shared link) and **before** falling back to "first connection in the list."

## Part 3 — History → resume a session

- `app/aurasql/history/page.tsx`'s `DataTable` gains a row action linking to `/aurasql/query?session=${log.session_id}` (or equivalent id field — verify exact field name in `AuraSqlSession`/history log type in `lib/types.ts` during implementation), using the query page's **already-working** `sessionParam` → `loadSessionHistory()` path (`query/page.tsx:240-245`). No query-page changes needed here — purely wiring a missing link.

## Part 4 — Dedupe redundant buttons

- `app/aurasql/connections/new/page.tsx`, `app/aurasql/connections/[id]/page.tsx`, `app/aurasql/contexts/new/page.tsx` each currently render both a "Back" and a "Cancel" control that perform the identical `router.push` to the same list route. Collapse to one action per screen.

## Part 5 — Wire up Settings

- `app/aurasql/settings/page.tsx`'s three toggles (confirm-before-execution, open-as-table default, result row limit) move from local `useState` to persisted storage (same `lib/aurasql/lastUsed.ts`-style module, or a dedicated `lib/aurasql/settings.ts`).
- `query/page.tsx` reads these on mount and honors them:
  - **Confirm before execution**: `handleExecuteMessage` (line 516) gets a confirmation step (reuse the existing `useToast`/`confirm` pattern already used elsewhere in the app, e.g. `Sidebar.tsx`'s `confirm()` usage) before calling `apiClient.executeAuraSqlWithSession`.
  - **Open as table by default**: controls the initial view mode `AuraSqlResultViewport` renders in (verify that component's prop surface during implementation — it may already accept a default-view prop, or need a small addition).
  - **Result row limit**: seeds `showRows` (currently hardcoded to `10` in a few places, e.g. line 312, 500) from the persisted setting instead of a literal.

## Explicitly out of scope

- Any change to the SQL generation/execution backend, or to `/api/v2` vs other API surfaces.
- Restructuring `/aurasql/connections` or `/aurasql/contexts` as list/management pages.
- Career, Chat, or Analyst studios — separate follow-on work, not part of this pass.

## Testing / verification

- `npm run lint`, `tsc --noEmit`, and the existing Vitest suite must stay green (check for any AuraSQL-specific test files first).
- Manual verification: first-time flow (no connections) from a clean account should reach "ask a question" without leaving `/aurasql/query`; returning-user flow should land pre-selected; a History row should resume its session; Settings toggles should visibly affect execution/display behavior.
