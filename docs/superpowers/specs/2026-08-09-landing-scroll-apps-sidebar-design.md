# Landing Scroll Extension, Studio CTAs, Expandable Sidebar, /apps Reformat — Design

## Context

The shipped landing page (`frontend/app/page.tsx`) pins a scroll-driven 3D terrain sequence (`components/flagship-terrain/TerrainSequence.tsx` + `TerrainScene.tsx`) for the hero and the four studio panels, then drops into two ordinary (non-pinned) sections below it — `TechnicalProof.tsx` and `CreatorStory.tsx`. Each studio panel in the pinned sequence shows a decorative, non-interactive "Benchmarking →" label. Separately, `/apps` (`components/platform/CinematicAppGallery.tsx`) uses a different visual system (theme-aware per-app photo backdrops) from the landing page, and the authenticated app shell's left navigation (`components/shell/AdaptiveRail.tsx`) is a permanently icon-only rail with tooltip-only labels, including for the login control.

This work makes four changes, confirmed with the user through brainstorming:

1. Fold Proof and Creator content into the pinned 3D scroll sequence on `/` as two more camera-dollied segments, rather than leaving them as static sections below it.
2. Turn each studio panel's "Benchmarking →" label into a real link reading "Enter Keystone [Name]" that navigates to that studio's real route.
3. Make the authenticated shell's left rail (`AdaptiveRail`) expandable — labels visible by default, collapsible to the current icon-only rail, state persisted.
4. Reformat `/apps` to match the landing page's visual system, including an ambient (non-scroll-pinned) version of the terrain backdrop, and fix login handling there (labeled control + gating app launches behind login for anonymous visitors).

## Scope decisions (confirmed with user)

| Decision | Answer |
|---|---|
| Proof/Creator integration depth | Fully pinned into the 3D camera sequence as 2 new segments (8 total), not just restyled static sections. |
| Studio panel CTA label | Per-panel "Enter Keystone [Name]" (e.g. "Enter Keystone SQL"), not a generic label. |
| `/apps` visual depth | Reskin toward the landing system, **plus** its own ambient 3D terrain backdrop (not just a color/typography pass). |
| `/apps` login handling | (a) Sidebar expansion makes the login control a labeled row instead of a bare icon; (b) anonymous "Open workspace" clicks are gated behind the login overlay instead of navigating into a studio page that will error without a session. |
| Sidebar default state | Expanded (names visible) by default; user can collapse to the current icon-only rail. |

## Part 1 — Pinned scroll gains Proof and Creator segments

### Current structure

`TerrainSequence.tsx` has `SEGMENTS = 6` (Hero, 4×`StudioPanel`, Finale) driving `scrollYProgress` fade/slide windows via `segmentRange(index)`. In parallel, `TerrainScene.tsx` builds `CAMERA_WAYPOINTS` as `[wide, ...4 marker stops, finale]` (6 points, 5 legs) and maps `progress * SEGMENT_COUNT` to a waypoint pair to lerp the camera between. The two counts (6 panels vs. 5 camera legs) are already independently tuned — not required to match exactly.

`TechnicalProof.tsx` renders `PROOF_POINTS` (from `lib/flagship-content.ts`) as a 2-column definition list. `CreatorStory.tsx` renders `CREATOR_PROFILE.ownership` (from `lib/creator-profile.ts`) plus a link to `/developer`. Both are plain, non-pinned sections placed after `<TerrainSequence />` in `page.tsx` today.

### New structure

- `SEGMENTS` becomes `8`: Hero(0), 4×Studio(1–4), Proof(5), Creator(6), Finale(7).
- Two new panel components in `TerrainSequence.tsx`, following the existing `StudioPanel` pattern (`segmentRange(5)` / `segmentRange(6)`, fade/slide via `useTransform`):
  - `ProofPanel` — renders the same `PROOF_POINTS` pairs as `TechnicalProof.tsx` did, restyled to the sequence's dark/mono register (no card/border chrome — matches the panel style already used by `StudioPanel`).
  - `CreatorPanel` — renders `CREATOR_PROFILE.ownership` and a "Read the engineering story →" link to `/developer`, matching `CreatorStory.tsx`'s copy.
- `TerrainScene.tsx` gains 2 more entries in `buildCameraWaypoints()`, inserted between the last marker stop and `finale`: a "proof console" waypoint and a "creator beacon" waypoint. Each gets a small distinct terrain-anchored visual (reusing the existing `buildMarker()`-style post/ring/glow primitives, not the 4 studio `MARKERS`) so the camera has a concrete subject, consistent with how the 4 studio markers work. `SEGMENT_COUNT` recalculates automatically off the new `CAMERA_WAYPOINTS.length - 1`.
- `page.tsx` drops the standalone `<TechnicalProof />` and `<CreatorStory />` imports/renders — their content now lives inside `<TerrainSequence />`.
- `StaticFallback` (the reduced-motion/coarse-pointer/low-memory non-pinned rendering path) gains 2 more stacked entries — a proof list and the creator line — so nothing is lost when the pinned experience is disabled.

### Out of scope for Part 1

- No change to the hero panel, the 4 studio markers/panels' content, or the finale panel's copy.
- No change to `TechnicalProof`/`CreatorStory` as components — they're removed from `page.tsx`'s render tree, not deleted as dead code, only if nothing else references them (verify before deleting the files themselves).

## Part 2 — Studio panel CTA becomes a real link

`lib/flagship-content.ts`'s `CAPABILITIES` entries get an id→route mapping (either a new field on each entry or a small co-located `id: route` map — implementation detail for the plan) covering the 4 real studio routes:

| `CAPABILITIES` id | Route |
|---|---|
| `knowledge` | `/chat` |
| `aurasql` | `/aurasql` |
| `analysis` | `/analysis` |
| `career` | `/career` |

In `StudioPanel` (`TerrainSequence.tsx`), the `<span>… Benchmarking …</span>` becomes a `<Link href={route}>Enter Keystone {item.name.replace("Keystone ", "")}… ` — concretely "Enter Keystone SQL", "Enter Keystone Chat", etc. (derived from `item.name`, not hand-duplicated strings). The parent `motion.div` stays `pointer-events-none` (required for scroll perf per the existing comment in the file), but the link itself gets `pointer-events-auto` plus the same focus-ring treatment used elsewhere in this file, so it's keyboard-reachable and clickable without breaking the pinned scroll's hit-testing.

## Part 3 — `AdaptiveRail` becomes an expandable sidebar

### State

A small shared hook (e.g. `useSidebarExpanded()` in `hooks/` or a light context) holds a boolean, default `true` (expanded), persisted to `localStorage` (e.g. key `keystone.sidebar.expanded`), read once on mount (SSR-safe default, then hydrate). No new global state library needed — this is a single boolean, Zustand would be overkill per existing patterns but a plain `useState` + `useEffect` localStorage sync is consistent with how the rest of the app handles small persisted UI prefs.

### Rail layout

- Expanded (default): width grows from `w-14` to roughly `w-56`. Each `RailLink` renders its icon plus a visible label (currently only in `aria-label`/`title`) — text truncates, doesn't wrap. `JobCenter`/`AppearanceControl`/`AccountControl` stop having their label `<span>` force-hidden (the CSS in `AdaptiveRail`'s wrapper divs — `[&_button>span]:hidden` etc. — is dropped when expanded, kept when collapsed) so "Log in" / account email / job status render as visible text, not just an icon.
- Collapsed: unchanged from today's `w-14` icon-only rail with tooltips.
- A toggle control (chevron/panel icon) sits at the bottom of the rail near `AccountControl`, flips the persisted state.
- `Dashboard` and per-app `RailLink`s keep their existing active-state pill (`layoutId="active-application"`), just wider when expanded.

### Layout propagation

`CinematicAppShell`'s content wrapper (`md:pl-20`) and `LocalSubmenu`'s `md:ml-20` are currently hardcoded to the collapsed rail's width. Both switch to reading the same expanded/collapsed state (via the shared hook) and apply the matching offset (`md:pl-20` collapsed vs. a new wider offset expanded), so content never sits under the rail or leaves an oversized gap when collapsed. Mobile bottom nav (`AdaptiveRail`'s second `<aside>`) is untouched — it already shows labels via `ApplicationSwitcher`/icons appropriately for its form factor and isn't part of this ask.

## Part 4 — `/apps` reformat

### Ambient terrain backdrop

New `AmbientTerrainBackdrop` component (`components/flagship-terrain/`) reuses `TerrainScene.tsx`'s height-field, shader, and particle-field building blocks but drives the camera with a slow autonomous drift (a gentle orbit/sway loop) instead of a `progressRef` tied to page scroll — appropriate for a dashboard page people revisit rather than a one-time cinematic reveal. It has no studio markers, no benchmark post/resolve logic — just the terrain surface, fog, particles, and bloom, at a lighter render cost than the full landing sequence. It's gated behind the same `useCinematicEffects()` check as the landing terrain, with a static gradient fallback (reusing the landing sequence's `FOG_COLOR`/`COLOR_*` tokens) for reduced-motion/coarse-pointer/low-memory/save-data cases.

`CinematicAppShell.tsx` swaps its backdrop conditionally: when `presentation.id === "platform"` (covers `/apps` and `/workflows`, per the existing `fallback` presentation in `lib/presentation/registry.ts`), render `<AmbientTerrainBackdrop />` instead of `<CinematicBackdrop media={presentation.media} />`. Every other studio page (`/chat`, `/aurasql`, `/analysis`, `/career`, etc.) keeps its existing per-app photo backdrop — untouched.

### Visual system

`CinematicAppGallery.tsx` and `AppCard.tsx` are restyled from the current theme-aware light/dark photographic treatment to the landing page's dark instrument system: navy ground (`#0a0f1c` / existing `--background` dark value where equivalent), `hsl(var(--copper))`/`hsl(var(--signal))` accents, Space Grotesk display type + IBM Plex Mono labels/readouts, hairline dividers in place of the current card-with-shadow/blur treatment where reasonable. The existing structural layout (full-bleed content area, bottom horizontal card carousel selecting the active app) is kept — this is a palette/typography/surface pass, not a structural rebuild, consistent with the "reskin" option but extended with the ambient 3D backdrop the user asked for on top of it.

### Login handling

- `AuthController` (currently only mounted on `/` and implicitly `/landing-v2` via their own pages) gets mounted on `/apps` as well, so the same login/register overlay used on the landing page is available there.
- `AuthController` gains support for an optional `next` param alongside its existing `auth` query param (e.g. `?auth=login&next=/aurasql`) — on successful login/register, if `next` is present and passes the existing safe-route check pattern (reuse `SAFE_FRONTEND_ROUTE`-style validation already present in `lib/apps/client.ts`), it navigates there instead of just closing the overlay.
- In `CinematicAppGallery.tsx`, the "Open workspace" link's click handler checks `useAuthStore().user`: if absent, it prevents the default navigation and dispatches `keystone:auth` with `{ mode: "login", next: directApplicationRoute(activeApp) }` (extending the existing `CustomEvent` detail shape, which today only carries a mode string — becomes a small object, updating the 5 existing dispatch sites in `flagship-terrain`/`flagship-cinema` to the new shape for consistency). If a user is present, the link behaves exactly as it does today (plain navigation).
- The rail's `AccountControl` "Log in" affordance switches from `router.push("/auth")` to dispatching the same `keystone:auth` event (opening the overlay in place) for consistency with the rest of the app — `/auth` as a standalone route can remain as a fallback/direct-link target, just no longer the rail's primary path.

## Explicitly out of scope

- Any change to the 4 studio pages' own content, layout, or their existing photo backdrops.
- Any change to `/landing-v2` (the separate quiet/monochrome experiment) — untouched.
- Redesigning `AppCard`'s selection/carousel interaction model — only its visual treatment changes.
- A new global state library for the sidebar's expand/collapse preference — a persisted boolean is sufficient.
- Backend/catalog changes — `AppManifest`/`frontend_route` data shape is unchanged; the studio-route mapping in Part 2 is frontend-only static data mirroring what the backend catalog already resolves for the 4 known studios.

## Testing / verification

- No frontend test framework is configured (per `CLAUDE.md`) — verification is visual and manual: `npm run dev`, then:
  - `/`: scroll through all 8 pinned segments at desktop and mobile widths (and with `prefers-reduced-motion` forced, to check the extended `StaticFallback`); confirm each studio panel's new link navigates correctly and is keyboard-reachable.
  - Authenticated shell: toggle the rail expanded/collapsed on a couple of different pages, confirm content offset tracks correctly, confirm the preference persists across a reload.
  - `/apps`: confirm the ambient backdrop renders (and its reduced-motion fallback), confirm the restyled gallery/cards read as part of the same visual system as `/`, and confirm both logged-out (gated redirect-after-login) and logged-in (direct navigation) "Open workspace" flows.
- `npm run lint` must pass on all changed/new files.
