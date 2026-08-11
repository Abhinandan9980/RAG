# Landing Page Experiment: "Field Notes" (Quiet Landing) — Design

## Context

Keystone's current public landing page (`frontend/app/page.tsx`) ships the "Surveyor's Instrument" direction: a full-intensity 3D terrain/triangulation hero on a Committed navy/brass/ivory/signal-orange palette. It was designed, built, and finish-reviewed (3 rounds, disposition "ship") as of 2026-08-09, per `KEYSTONE_REDESIGN_SPEC.md`. It is not being replaced by this work.

The user surfaced [illoca.unseen.co](https://illoca.unseen.co/) — an AI-assisted architecture-design SaaS landing page — as inspiration for a second, experimental landing direction to compare against the shipped one, not to replace it.

Illoca's page is the opposite register from Keystone's shipped landing: strict monochrome (white/black/gray, near-zero color), no 3D/WebGL, generous whitespace, a numbered 1–5 feature sequence mirroring the user's real workflow, an "Open Letter" founder-voice manifesto section, an FAQ accordion, and a confident, restrained copy tone that explicitly avoids AI-hype language. It is a commercial SaaS page (pricing tiers, credit system, signup CTA) — Keystone is a portfolio/demo surface (per `KEYSTONE_REDESIGN_SPEC.md`: audience is recruiters/interviewers evaluating the creator's engineering skill; no fabricated metrics or customers), so the commercial-funnel sections don't carry over.

## Goal

Build a second, real, interactive landing page at a new route so the "quiet/monochrome" direction can be viewed and compared against the current one before any decision is made to adopt, discard, or blend it. Nothing about the existing shipped landing page, its components, or the global design tokens changes as part of this work.

## Scope decisions (confirmed with user)

| Decision | Answer |
|---|---|
| Relationship to shipped landing | Additive, side-by-side. New route, existing `/` untouched. |
| Commercial sections (pricing/credits/signup funnel) | Dropped entirely — not applicable to a portfolio/demo product. CTA becomes "Enter Keystone" (opens existing `AuthController` login/register overlay), not "Try for free." |
| Route / implementation | Real Next.js route (`/landing-v2`), not a static HTML mockup — reuses existing design-system primitives so it's a genuine, interactive comparison, not a throwaway image. |
| Palette | Monochrome + one accent: true neutral near-black/near-white base (distinct from the shipped navy/ivory), with the existing `signal-orange` token kept as the one reserved accent for brand continuity. |
| Numbered capability sequence | 4 items, one per real studio (Chat, SQL, Analyst, Career) — no invented 5th step. |
| Manifesto/"Open Letter" section | Included, built from real content already in `frontend/lib/creator-profile.ts` (`CREATOR_PROFILE.ownership`, `.principles`) — no fabricated founder-story content. |
| Typography | Reuse existing Space Grotesk (display/body) + IBM Plex Mono (label/readout) pairing — no third typeface introduced. |
| Global tokens / `DESIGN.md` | Untouched. New neutral/spacing values are scoped locally to this route, not added to `globals.css`/`tailwind.config.js`. |

## Architecture

- **Route:** `frontend/app/landing-v2/page.tsx` (new page, new folder). Not linked from primary nav; reachable only by direct URL while it's a comparison draft.
- **Components:** new directory `frontend/components/flagship-quiet/` — mirrors the existing `components/flagship/` structure (one component per section) so it's easy to diff conceptually against the shipped page, but is a fully separate tree: `QuietHeader.tsx`, `QuietHero.tsx`, `QuietCapabilitySequence.tsx`, `QuietProof.tsx`, `QuietManifesto.tsx`, `QuietFaq.tsx`, `QuietFooter.tsx`.
- **Styling:** a single wrapper class (e.g. `.landing-quiet`) applied at the page root, scoping a small set of new CSS custom properties (true neutral ground/ink colors, wider section spacing) via a scoped block in `globals.css` (additive rule under the existing token block, not a modification of shipped tokens) or a co-located CSS module — implementation detail for the plan step. `signal-orange` and the existing type-scale CSS vars (`--font-space-grotesk`, `--font-ibm-plex-mono`, display/headline/body/label sizes) are read directly from the existing token system, not redefined.
- **Content reuse (no fabrication):**
  - Capability sequence pulls from the existing `CAPABILITIES` array in `frontend/lib/flagship-content.ts` (already real, already used by the shipped `CapabilityStory.tsx`) — same 4 studios, same statements/proof points, restyled only.
  - Technical proof section pulls from the existing `PROOF_POINTS` array in the same file (already used by the shipped `TechnicalProof.tsx`).
  - Manifesto pulls from `CREATOR_PROFILE` in `frontend/lib/creator-profile.ts` — `ownership` line as the letter's core statement, `principles` as a short list, `links` for footer.
  - FAQ content is new copy but must state only real, verifiable facts about the actual system (stack, self-hosting, data handling) — no invented policy claims (e.g. no data-training promises unless verified against actual backend behavior).
- **Auth/CTA:** the hero and header CTA ("Enter Keystone") open the existing `AuthController` overlay component, exactly as the shipped landing does — no new auth flow.

## Section-by-section content

1. **Header** — sticky, minimal. "Keystone" wordmark, nav links (Studios / Proof / Manifesto — in-page anchor links), single CTA button.
2. **Hero** — no 3D scene. Large Space Grotesk display headline restating Keystone's real thesis ("one retrieval engine, four studios, no guessing") in a confident-declarative register close to Illoca's. One-line subhead. Single CTA. One small monospace live-readout detail in a corner as the sole callback to the shipped brand's instrument motif (e.g. a real citation/confidence figure, or a static "surveyed, not guessed" mark) — static or minimal-motion, never a scene.
3. **Capability sequence** — 4 items, numbered 01–04, from `CAPABILITIES`: Keystone Chat, Keystone SQL, Keystone Analyst, Keystone Career. Each: number, name, statement, proof points, direct link into that studio.
4. **Technical proof** — from `PROOF_POINTS`, restyled into the monochrome/hairline register (no card-with-shadow treatment).
5. **Manifesto ("Open Letter")** — first-person section built from `CREATOR_PROFILE.ownership` and `.principles`, in Shivam's voice.
6. **FAQ** — existing `Accordion` primitive. Small set (4–6) of real questions/answers about stack, self-hosting, data handling, and how confidence scoring works.
7. **Footer** — minimal, GitHub/LinkedIn links from `CREATOR_PROFILE.links`.

## Visual style: "Field Notes"

- **Ground:** true near-white base, near-black ink text — a genuinely neutral monochrome, distinct from the shipped Committed navy/ivory palette.
- **Accent:** existing `signal-orange` token only, spent on exactly: the hero's live readout, the CTA, the capability sequence's numeral digits, and the FAQ's active-item marker. Nowhere else.
- **Surfaces:** no cards, no shadows, no blur/glass. Sections separated by a single hairline rule. Section padding wider than the shipped `--spacing-section: 6rem` (target ~8–10rem) for Illoca-style breathing room.
- **Motion:** minimal — simple opacity/translate-Y fade-in on scroll per section. No parallax, no 3D, no sweep/reticle animation.
- **Type scale:** reuse existing `display`/`headline`/`title`/`body`/`label` tokens as-is; no new sizes.

## Explicitly out of scope

- Any change to `frontend/app/page.tsx` or the existing `components/flagship/*` components.
- Any change to `globals.css` base tokens, `tailwind.config.js`, or `DESIGN.md`.
- Pricing tiers, credit system, signup-funnel copy, or any commercial-SaaS framing.
- A 5th "confidence scoring" capability step (kept to 4, one per real studio).
- A third typeface.
- Fabricated testimonials, customers, usage metrics, or unverified policy claims (data training, etc.) in FAQ copy.
- Wiring `/landing-v2` into primary navigation or making it the default `/` route — that decision comes after comparison, not as part of this work.

## Testing / verification

- No existing test suite covers landing pages (per `CLAUDE.md`: no frontend test framework configured). Verification is visual: run `npm run dev`, view `/landing-v2` at desktop and mobile widths, and screenshot-compare against `/` before calling this done.
- `npm run lint` must pass on the new route/components.
