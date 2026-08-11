---
name: Keystone
description: "One retrieval engine, four studios, no guessing — a surveyor's-instrument RAG platform where every answer is triangulated, cited, and confidence-scored."
colors:
  surveyor-ink:
    light: "hsl(222 40% 12%)"
    dark: "hsl(40 28% 93%)"
  workspace-field:
    light: "hsl(40 32% 96%)"
    dark: "hsl(222 46% 7%)"
  brass-copper:
    light: "hsl(36 48% 40%)"
    dark: "hsl(36 42% 56%)"
  signal-orange:
    light: "hsl(18 82% 46%)"
    dark: "hsl(18 88% 56%)"
  instrument-data-blue:
    light: "hsl(200 70% 38%)"
    dark: "hsl(200 68% 58%)"
  contour-card:
    light: "hsl(40 28% 99%)"
    dark: "hsl(222 38% 10%)"
  border-etch:
    light: "hsl(40 16% 82%)"
    dark: "hsl(222 20% 19%)"
  muted-foreground:
    light: "hsl(222 12% 40%)"
    dark: "hsl(220 10% 62%)"
  destructive:
    light: "hsl(4 68% 45%)"
    dark: "hsl(4 62% 42%)"
  chart-4-verified-green:
    light: "hsl(150 40% 32%)"
    dark: "hsl(150 35% 45%)"
typography:
  display:
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.06em"
  headline:
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace"
    fontSize: "0.6875rem"
    letterSpacing: "0.18em"
    fontFeature: "uppercase"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  panel: "1.75rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.brass-copper}"
    textColor: "hsl(40 32% 98%)"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.surveyor-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.surveyor-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.contour-card}"
    textColor: "{colors.surveyor-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  hero-instrument-panel:
    backgroundColor: "{colors.contour-card}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

# Design System: Keystone

## Overview

**Creative North Star: "The Surveyor's Instrument"**

Keystone's landing surface stages a land surveyor's discipline: nothing is asserted until it is triangulated. A reticle sweeps a field of scattered source shapes — a PDF, a SQL query, a spreadsheet, a resume — draws sightlines to them, and lets them resolve into a single cited, confidence-scored point. Deep surveyor's-ink navy grounds the field; brass/bronze carries authority and instrument warmth; warm ivory reads as contour paper; signal-orange is spent only where the system is actively certifying something (a live confidence readout, a resolved lock, a "verified" tier) — never as generic decoration. This is a deliberately Committed palette on the public surface: one saturated accent, held in reserve, so its appearance always means something.

The four authenticated studios (Chat, SQL, Analyst, Career) are built from the exact same token vocabulary — same navy/brass/ivory ground, same signal-orange, same Space Grotesk + IBM Plex Mono pairing — but run a **Restrained** strategy: neutrals plus the one accent, no crosshair sweep, no triangulation animation, minimal motion. This is a deliberate two-register system (see Named Rules below), not an inconsistency between "the marketing version" and "the real app." A recruiter who clicks past the hero into a studio should feel the same instrument, turned down to working volume.

The build rejected glassmorphism-as-decoration (frosted panels appear only as the hero's actual instrument-panel device, not as ambient chrome), rejected a fabricated line-chart standing in for data the system doesn't have, rejected kicker/eyebrow labels above headings project-wide, and rejected a third display typeface (an editorial serif, Newsreader, was fully removed) once weight/style variation within Space Grotesk alone proved sufficient for hierarchy.

**Key Characteristics:**
- Committed color strategy on landing (one accent, high restraint elsewhere); Restrained variant in the four studios, sharing tokens not intensity.
- Reticle/triangulation/contour-line visual grammar, native to the surveying world — used as the hero's mechanism, not scattered as generic ornament.
- Space Grotesk (geometric sans, display and body) + IBM Plex Mono (label, readout, code) as the only two typefaces in the shipped system.
- Flat-to-tonal surfaces; the hero's frosted instrument panel is the one deliberate glass moment, not a system-wide material.
- Confidence and status are always color-coded and always visible — never a hidden implementation detail.

## Colors

The palette reads as one instrument, not a decorative kit: a dark ink ground, one warm metal (brass/copper), and one hot accent (signal-orange) that is spent only on live/verified moments. A second, cooler blue (`--data`) exists distinctly from brass and signal so triangulation lines and data can be told apart from the brand's warm identity colors.

### Primary
- **Brass Copper** (`hsl(36 48% 40%)` light / `hsl(36 42% 56%)` dark — token `--copper`, mapped to `--primary`): the instrument-metal tone. Primary buttons, active nav states, the logo mark, headline emphasis (`surveyed.` is set in copper italics in the hero).

### Secondary
- **Signal Orange** (`hsl(18 82% 46%)` light / `hsl(18 88% 56%)` dark — token `--signal`, mapped to `--accent`): reserved for "live" and confidence moments only — the hero's resolved triangulation point, the confidence-readout percentage, high-confidence score tiers, the selection highlight. Its scarcity is the point; it does not appear as a generic hover or brand-flourish color.
- **Instrument Data Blue** (`hsl(200 70% 38%)` light / `hsl(200 68% 58%)` dark — token `--data`): triangulation sightlines and source nodes in the hero mark, and SQL syntax-highlighting strings. Kept visually distinct from brass/signal so "this is data/measurement" reads apart from "this is the brand."

### Neutral
- **Surveyor Ink** (`hsl(222 40% 12%)` light-mode foreground / `hsl(222 46% 7%)` dark-mode background): the deep navy-black that grounds the whole system — dark-mode page background, light-mode body text.
- **Contour Ivory** (`hsl(40 32% 96%)` light background / `hsl(40 28% 93%)` dark foreground): warm paper-toned content ground in light mode, warm off-white text in dark mode.
- **Card Paper** (`hsl(40 28% 99%)` light / `hsl(222 38% 10%)` dark — token `--card`): surface color for cards, popovers, message bubbles, one step lighter/darker than the page background.
- **Border Etch** (`hsl(40 16% 82%)` light / `hsl(222 20% 19%)` dark — token `--border`): all rules, dividers, and default control strokes.
- **Muted Foreground** (`hsl(222 12% 40%)` light / `hsl(220 10% 62%)` dark): secondary text, captions, metadata rows.
- **Destructive Red** (`hsl(4 68% 45%)` light / `hsl(4 62% 42%)` dark): errors, failed states, low-confidence/low-match score tiers.

### Named Rules
**The Accent-Means-Something Rule.** Signal-orange never fills a surface or decorates a passive element. It appears only where the system is asserting confidence or liveness: the hero's resolved benchmark point, a confidence percentage, a "high" score tier, active selection state, focus rings. If an element with signal-orange isn't actively certifying something, it's misused.

**The Cited Exception Rule.** `--chart-4` (a muted green, `hsl(150 40% 32%)` light / `hsl(150 35% 45%)` dark, defined for the chart/data-visualization series) is deliberately reused as the semantic success/verified/ready status color across the four studios — "completed" job badges, verified-report labels, matched-skill tags, step-completion checks — in addition to the single signal-orange accent. This is the one place the Restrained strategy's "neutrals plus the one accent" rule is knowingly not followed literally: status/success is a functional scan-by-color requirement, and reusing an already-tokenized hue was judged preferable to inventing an untracked new color or dropping status color-coding. Treat this as a second, narrowly-scoped semantic accent — not a license to introduce further ad hoc colors.

**The Two-Register Rule.** Landing/public surfaces run Committed (full palette expression, hero mechanism, glass instrument panel). The four authenticated studios run Restrained (neutrals + signal-orange + the cited chart-4 exception only — no crosshair/triangulation animation). Same tokens, different volume, by design.

**The Threshold Exception.** `/apps` (the app catalog/dashboard a signed-in visitor lands on and revisits, distinct from the four task-oriented studios) borrows one landing-world device — the terrain instrument as an ambient backdrop (`AmbientTerrainBackdrop`/`AmbientTerrainScene`, reusing the same height-field/shader/particle code as the landing sequence via `components/flagship-terrain/terrain-core.ts`), held at a fixed wide shot with only a slow ambient drift, no scroll-pinned camera dolly, no per-entity markers, no narrative sequence. `/apps` respects the site's light/dark toggle (its chrome — `AdaptiveRail`, `CinematicAppGallery`, `StudioTile` — reads normal theme tokens throughout, exactly like the four Restrained studios) — and, since the terrain world itself now carries a light palette (`terrain-core.ts`'s `DARK_PALETTE`/`LIGHT_PALETTE`), the terrain backdrop follows the toggle too instead of falling back to a plain background in light mode. Confirmed with the user after an earlier hardcoded-dark pass on `/apps` was tried and rejected — a signed-in dashboard people revisit has to respect their theme choice. Scoped to `/apps`/`/workflows` only; the four studios remain unaffected either way.

**The landing page also now respects the toggle.** Originally the landing hero (`TerrainSequence.tsx`) was a deliberately theme-exempt, always-dark cinematic reveal — reasoned as a "one-time public marketing scroll" distinct from a revisited dashboard. That exemption was reversed by explicit user decision: the terrain world's shared light palette made a light-mode landing hero low-cost to support once `/apps` needed one anyway, so the hero's panel text/borders now read normal theme tokens (`text-foreground`, `text-muted-foreground`, `border-border`) and the terrain shader takes the same `LIGHT_PALETTE`/`DARK_PALETTE` as `/apps`, with the copper/signal accent colors unchanged (they were already theme-tokenized). The scroll-pinned camera dolly, per-studio marker sequence, and glass instrument panel remain landing-exclusive — only the "ignores the toggle" behavior was reversed, not the Committed-intensity narrative device itself.

## Typography

**Display Font:** Space Grotesk (with system-ui, sans-serif fallback)
**Body Font:** Space Grotesk (same family; weight/style carry hierarchy)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace fallback)

**Character:** A single geometric sans doing double duty across display and body, paired with a monospace reserved for anything that reads as measured data — coordinates, confidence percentages, SQL, uppercase labels. The pairing is deliberately narrow: a third face (Newsreader, an editorial serif) was fully removed mid-build once headline emphasis (e.g. the hero's italicized "surveyed.") proved achievable with weight and style variation inside Space Grotesk alone.

### Hierarchy
- **Display** (900 weight, `text-5xl` to `text-8xl` / clamp ~2.5rem–6rem, leading-[.92], tracking `-.06em`): the landing hero headline only ("Answers, surveyed.").
- **Headline** (700–800 weight, `text-4xl`–`text-5xl`, tight tracking): section headers on the landing page (e.g. "Move from evidence to a finished decision.").
- **Title** (600 weight, `text-2xl`–`text-3xl`, tight leading): `CanvasHeader`'s per-studio page title; capability/article sub-headers.
- **Body** (400–500 weight, `text-sm`–`text-base`, leading-6/7): descriptions, paragraph copy, muted-foreground supporting lines. Line length is left to container width (max-w-2xl/3xl containers), not fixed ch.
- **Label** (500–600 weight, `text-[10px]`–`text-[11px]`, tracking `.18em`, uppercase, IBM Plex Mono): readouts, badges, `ContextRibbon`'s section label, the confidence/source counters in the hero's instrument panel.

### Named Rules
**The Two-Face Rule.** Only Space Grotesk and IBM Plex Mono ship. Any third typeface is a defect, not an option — it was already found and removed once this build.

## Layout

Studio screens (Chat/SQL/Analyst/Career) share one chrome system: `CanvasHeader` (title + optional status/eyebrow-free description + right-aligned actions) sits above an optional `ContextRibbon` (a horizontally-scrolling, sticky-labeled strip for active-context chips), both inside `FocusCanvas` — a `min-h-[calc(100svh-2rem)]` main region capped at `max-w-[100rem]`, with responsive padding (`px-4`/`sm:px-6`/`md:px-8`/`lg:px-10`) and bottom padding reserved for the mobile tab bar (`pb-28` on mobile, `pb-8` on desktop). Secondary/contextual detail panels use `Inspector`, a right-docked, focus-trapped overlay (`w-[min(30rem,42vw)]` on desktop, full-screen on mobile) rather than a second page or a nested route.

The landing page is a single vertically-scrolling narrative, not a grid dashboard: full-viewport hero (`min-h-[92svh]`), then `border-y`-bounded full-bleed sections (`CapabilityStory`, `TechnicalProof`, `CreatorStory`) each capped at `max-w-6xl` and given generous vertical rhythm (`py-24`). Container padding is `2rem` centered up to a `1400px` cap at the `2xl` breakpoint (Tailwind's default container config, unmodified).

Studio and landing content share the same spacing rhythm: 4/8px-multiple gaps (`gap-2`, `gap-3`, `gap-6`, `gap-9`, `gap-14`) rather than an arbitrary scale.

## Elevation & Depth

The system is flat by default and lifts only at specific, motivated moments — it is not a shadow-driven material system. Cards use a near-invisible `shadow-sm`; the one deliberate elevated material is `.glass-panel` (a frosted `backdrop-blur-xl` surface with a soft ambient shadow), reserved for the landing hero's instrument panel and any panel that needs to visually float over the WebGL/animated scene behind it. This is a scoped device tied to the survey-instrument metaphor, not a general "everything is glass" rule — studio surfaces never use `.glass-panel`.

### Shadow Vocabulary
- **Ambient card** (`shadow-sm`, Tailwind default): default `Card` elevation; nearly imperceptible, signals "this is a discrete surface" without visual weight.
- **Glass panel** (`box-shadow: 0 18px 60px -40px rgba(0,0,0,0.35)` dark / `0 12px 38px -30px rgba(15,23,42,0.15)` light): the hero instrument panel and any panel floating over the SurveyScene.
- **Overlay/dialog** (`shadow-2xl`): `Inspector`'s slide-in panel, floating over the dimmed backdrop.
- **Confidence pulse** (`pulse-glow` keyframe, `0 0 26px hsl(var(--signal)/.35)` at peak): the one motion-driven shadow, used to make a signal-orange element visually "breathe" as a live/certifying cue — respects `prefers-reduced-motion`.

### Named Rules
**The Glass-Is-Scoped Rule.** Frosted glass exists exactly once in the shipped system — the landing hero's instrument panel over the WebGL terrain. It is not a general card treatment; studio surfaces stay flat/tonal.

## Shapes

Two radius languages coexist by design: interactive controls (buttons, inputs, badges) default to Tailwind's shadcn radius scale (`--radius: 0.5rem`, with `md`/`sm` steps calculated down from it) for a crisp, instrument-panel precision; primary CTAs on the landing page are full pills (`rounded-full`) instead, echoing a benchmark-marker/dial affordance. The hero's instrument panel itself uses a distinct, larger radius (`rounded-[1.75rem]`) to read as a physical device rather than a UI card. Borders are hairline (`border`, 1px) and low-contrast (`border-border/60`–`/70`), used to separate regions (header/ribbon dividers, card outlines) rather than to add visual weight.

## Components

### Buttons
- **Shape:** rounded-md (6px, `calc(0.5rem - 2px)`) for in-app/utility buttons; full pill (`rounded-full`) for landing-page primary CTAs.
- **Primary:** brass/copper background (`bg-primary`), primary-foreground text, `hover:opacity-90` on landing pill CTAs / `hover:bg-primary/90` on the shadcn variant used in-app.
- **Secondary / Outline:** transparent or bordered (`border-input`), hover fills with `bg-accent`/`bg-muted`.
- **Ghost:** no background at rest; hover fills with the accent tone. Used for icon-only actions (Inspector's close button, chat composer icon triggers).
- **Focus:** every interactive element (buttons, custom landing CTAs, Inspector's backdrop) carries an explicit `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` treatment — this is enforced even on hand-rolled landing buttons, not just shadcn primitives.

### Cards / Containers
- **Corner Style:** `rounded-lg` (8px).
- **Background:** `bg-card` (Contour Paper tone), one step off the page background.
- **Shadow Strategy:** `shadow-sm` ambient only; see Elevation & Depth.
- **Border:** default shadcn 1px border, low-contrast.
- **Internal Padding:** `p-6` header/content, `pt-0` where a header precedes content (shadcn default spacing, unmodified).

### Inputs / Fields
- **Style:** `h-10`, `rounded-md`, `border-input`, `bg-background`.
- **Focus:** `ring-2 ring-ring ring-offset-2` — a visible ring shift, no glow/blur effect.
- **Select / Checkbox / Switch / Popover / Tooltip:** shipped this build as shared Radix-based primitives (`components/ui/select.tsx`, `checkbox.tsx`, `switch.tsx`, `popover.tsx`, `tooltip.tsx`) replacing raw native `<select>` elements and hover-only tooltips across AuraSQL, Career, and Analyst forms — chosen specifically because native selects and hover-only tooltips fail on touch; every studio form now uses these instead of ad hoc markup.

### Navigation
- **Studio chrome:** `CanvasHeader` — a bottom-bordered header block with title (`text-2xl`–`text-3xl font-semibold`), optional description, and right-aligned action slot; no eyebrow/kicker label above the title (removed project-wide as a finish-review finding).
- **Context strip:** `ContextRibbon` — a horizontally-scrollable, sticky-labeled chip row (`text-[10px] uppercase` label pinned left) beneath the header, used for active-filter/context chips (e.g. SQL's schema/context selector).
- **App rail:** `AdaptiveRail` — the fixed left rail present across every authenticated route. Expandable: defaults to showing each destination's label alongside its icon (~14rem wide), collapsible by the visitor to the original icon-only rail (~3.5rem), preference persisted (`localStorage`) and read by `CinematicAppShell`/`LocalSubmenu` to keep content offset in sync. Not a register change — same rail, same tokens, just a density toggle the visitor controls.

### Signature Component: Terrain Sequence
The landing page's pinned scroll-driven centerpiece (`components/flagship-terrain/TerrainSequence.tsx` + `TerrainScene.tsx`, shared primitives in `terrain-core.ts`): a displaced-heightmap terrain with contour-line shading, fog, drifting particles, and bloom, flown over via a scroll-scrubbed camera — hero wide shot, one dolly-in per studio onto a survey-marker stake, a proof-console stop, a creator-beacon stop, then a pulled-back finale. Gated by `useCinematicEffects` (reduced motion, coarse pointer, save-data, low device memory) with a static stacked fallback. `/apps` reuses the same terrain primitives at a held wide shot (see the Threshold Exception above) but the scroll-pinned sequence itself is exclusive to the landing page — it is the one canonized instance of the world's full narrative device, not a pattern to duplicate into studio screens.

## Do's and Don'ts

### Do:
- **Do** spend signal-orange only on live/confidence/certifying moments (hero resolution point, confidence readouts, high-confidence tiers, focus/selection) — per the Accent-Means-Something Rule.
- **Do** use `--chart-4` for success/verified/ready status across studios, as the one named, cited exception to the single-accent rule — not as license for further raw colors.
- **Do** keep the landing page's Committed intensity (scroll-pinned camera dolly, narrative sequence, glass panel) exclusive to the public marketing surface; keep studios Restrained (tokens shared, theatrics withheld). `/apps` is the one named exception — see the Threshold Exception — and only for the ambient (non-narrative) terrain backdrop, not the full landing sequence. Both the landing hero and `/apps` now respect the site's light/dark toggle — see "The landing page also now respects the toggle" above.
- **Do** use the shared `Select`/`Checkbox`/`Switch`/`Popover`/`Tooltip` primitives for any new form control; they exist specifically to fix touch-inaccessible native selects and hover-only tooltips.
- **Do** compose new studio screens from `CanvasHeader` + `ContextRibbon` + `FocusCanvas` + `Inspector`; this is the converged, canonical chrome system.

### Don't:
- **Don't** add a kicker/eyebrow label above a heading anywhere in the product. This was shipped as a systemic defect (found in finish review, present above nearly every heading) and removed outright, including deleting the `eyebrow` prop from `CanvasHeader` itself. It is not a design-system option to bring back — see "not canonized" below.
- **Don't** introduce a third display typeface. Newsreader was fully removed (font loading, CSS variable, Tailwind entry) once weight/style variation within Space Grotesk proved sufficient; reintroducing a serif or any other face contradicts the Two-Face Rule.
- **Don't** fabricate decorative data visualization (e.g. a chart with no real underlying data). One was shipped in `TechnicalProof.tsx`, flagged in finish review as standing in for data the system doesn't have, and deleted rather than fixed. A second instance (`DashboardSignal.tsx`, an animated bar readout with hardcoded fake heights) was found in the `/apps` gallery during the terrain-scroll/sidebar rebuild and removed outright rather than reskinned — replaced with the app's real `required_capabilities`/`optional_capabilities` read out in mono type.
- **Don't** use `.glass-panel`/frosted backdrop-blur as a general card treatment outside the landing hero's instrument panel — it is a scoped device, not the system's default material.
- **Don't** introduce raw Tailwind color utilities (`emerald-500`, `green-500`, `sky-500`, etc.) for status or semantic meaning; route through the existing HSL custom properties (`--signal`, `--chart-4`, `--destructive`) even under deadline pressure — this exact defect class was found and fixed twice across two finish-review rounds before shipping clean.
