# Terrain Light-Mode Palette + Landing Re-theme — Design

## Context

The user flagged that `/apps` (the app catalog/dashboard) looks "raw" in light mode compared to dark mode. Reading `AmbientTerrainBackdrop.tsx` confirmed this is intentional-but-incomplete: `/apps` deliberately follows the site's light/dark toggle (per `DESIGN.md`'s "Threshold Exception" — confirmed with the user previously that a signed-in, revisited dashboard must respect theme choice, unlike the landing page). Dark mode gets the full three.js terrain scene (or a tuned gradient fallback when 3D is disabled); light mode currently just falls back to a flat `bg-background` + faint noise — correct per the "respect the toggle" principle, but visually thin next to the dark version.

The user then asked whether the same treatment could be reused on the landing page. Reading `TerrainSequence.tsx` / `TerrainScene.tsx` / `terrain-core.ts` showed the landing hero is **not** theme-aware at all today — hardcoded `text-white*` throughout every panel, a hardcoded `bg-[#0a0f1c]` container, and terrain shader colors (`COLOR_LOW/MID/HIGH`, `FOG_COLOR`, `HAZY`, `SIGNAL`) baked as fixed constants in `terrain-core.ts`. `DESIGN.md` documents this as a deliberate, previously-confirmed exception: landing is a "one-time public marketing scroll" exempt from the toggle, contrasted explicitly against `/apps`.

Confirmed with the user:

| Decision | Answer |
|---|---|
| `/apps` light-mode background | Full 3D terrain in light colors (not a static gradient) |
| Landing page scope | Include in this spec — reverse the documented "landing is theme-exempt" precedent; landing becomes theme-aware too |
| Light palette mood | "Sunlit paper" — warm cream/parchment sky matching the existing Contour Ivory light background (`hsl(40 32% 96%)`), sand/terracotta terrain, same copper/signal accent hues (already theme-aware via `globals.css`) |
| Visual companion | Not used — text-only design discussion |

This spec also updates the `DESIGN.md` paragraph documenting the old "landing is theme-exempt" precedent, since it will no longer be true.

## Architecture — parameterized palette, not duplicated scenes

`terrain-core.ts` exports `COLOR_LOW`, `COLOR_MID`, `COLOR_HIGH`, `FOG_COLOR`, `HAZY`, `SIGNAL` as fixed module-level `THREE.Color` constants, and `buildTerrain()`, `buildParticles()`, `buildMarker()` close over them directly for shader uniforms and materials.

Replace with:

```ts
interface TerrainPalette {
  colorLow: THREE.Color;
  colorMid: THREE.Color;
  colorHigh: THREE.Color;
  fogColor: THREE.Color;
  hazy: THREE.Color;
  signal: THREE.Color;
  particleColor: THREE.Color;
  particleBlending: THREE.Blending; // Additive (dark) vs Normal (light)
  particleOpacityScale: number;     // tone down light-mode particles
}

export const DARK_PALETTE: TerrainPalette = { /* today's existing values */ };
export const LIGHT_PALETTE: TerrainPalette = { /* sunlit-paper values, see below */ };
```

`buildTerrain(palette)`, `buildParticles(palette)`, `buildMarker(palette)` take the palette as a parameter instead of reading module constants. One shader/geometry implementation, two color sets — no duplicated three.js code between a "light terrain-core" and "dark terrain-core".

`TerrainScene` and `AmbientTerrainScene` both take a `palette: TerrainPalette` prop (resolved by their callers from `useAppearance()`'s theme) and use it for:
- `buildTerrain(palette)` / `buildParticles(palette)` / `buildMarker(palette)`
- `renderer.setClearColor(palette.fogColor, 1)`
- `scene.fog = new THREE.Fog(palette.fogColor.getHex(), ...)`

**Live theme toggling.** Rather than writing logic to live-update shader uniforms when the user flips the theme mid-session, the call site keys the dynamically-imported scene component with `key={resolvedTheme}` (e.g. `<AmbientTerrainScene key={resolvedTheme} ... />`). This forces React to unmount and remount the component on theme change, which runs the existing effect cleanup (dispose geometries/materials/renderer) and re-creates the scene fresh with the new palette — reusing all the existing lifecycle code instead of adding new update-in-place logic for a rare user action.

**Light palette values** (sunlit paper): sky/fog using the site's existing light background hue family (`hsl(40 32% 96%)`-adjacent, slightly deeper for the fog gradient so terrain contours stay legible against it), terrain low/mid/high shifted from the dark palette's cool-blue-to-warm-brass ramp to a warm sand → terracotta → sun-bleached-stone ramp, `hazy`/`signal` reuse the existing light-theme `--copper`/`--signal` HSL values from `globals.css` so accents match the rest of the light theme exactly. Exact HSL tuning happens during implementation with visual iteration in-browser (light/dark, both `/apps` and `/`), not fully pinned numerically in this doc.

**Particle blending risk.** The particle field currently uses `THREE.AdditiveBlending` with a warm glow color — correct for dark fog (light adds visible brightness against dark), but against a light cream background additive blending would wash the particles out toward invisible/white. Light palette uses `THREE.NormalBlending` with a modestly desaturated warm/copper particle color and reduced opacity so particles stay visible without turning into bright blown-out flecks.

## `/apps` — AmbientTerrainBackdrop + AmbientTerrainScene

Both branches in `AmbientTerrainBackdrop.tsx` get light equivalents instead of the current flat fallback:

- **3D enabled** (`effects.enabled`): renders `AmbientTerrainScene` with `LIGHT_PALETTE` when `resolvedTheme !== "dark"`, same held-wide-shot ambient drift as dark mode (no markers, no camera dolly — unchanged from today's dark behavior).
- **3D disabled** (reduced motion / coarse pointer / save-data / low memory): today's dark fallback is a layered radial+linear gradient tuned to the dark palette (`AmbientTerrainBackdrop.tsx:47-53`). Light mode gets the equivalent gradient re-tuned to sunlit-paper tones, replacing the current plain `bg-background` + 10%-opacity noise fallback.
- The outer noise/vignette overlay layers (`bg-noise`, bottom vignette gradient) stay structurally the same, re-tuned to lower-contrast values appropriate for a light background (today's values are tuned to deepen a dark scene toward its edges; a light scene needs a much subtler version or it reads muddy).

No change to `CinematicAppShell.tsx`'s usage — it already renders `AmbientTerrainBackdrop` unconditionally for the `"platform"` presentation; the component itself now handles both themes properly instead of one theme + one fallback.

## Landing page (`TerrainSequence.tsx`) re-theme

This is the larger diff, and the one that reverses the documented `DESIGN.md` precedent.

**Container:** `bg-[#0a0f1c]` (currently hardcoded, unconditional, in both the animated and `StaticFallback` render paths) becomes theme-resolved: dark navy in dark mode (today's value, unchanged), sunlit-paper base in light mode. Follows the same post-mount theme resolution pattern already used in `AmbientTerrainBackdrop.tsx` (SSR always assumes dark before `mounted`, to avoid hydration mismatch — `AppearanceProvider`'s SSR default is dark).

**Text/border tokens**, applied identically to `HeroPanel`, `StudioPanel`, `ProofPanel`, `CreatorPanel`, `FinalePanel`, and `StaticFallback`:

| Today (hardcoded) | Becomes |
|---|---|
| `text-white` | `text-foreground` |
| `text-white/70`, `text-white/85` | `text-muted-foreground` (or `text-foreground/85` where the copy is meant to read as primary, not secondary — decide per-line during implementation based on current visual weight) |
| `text-white/50`, `text-white/60` | `text-muted-foreground` (lighter-weight captions) |
| `text-white/80`, hover `text-white` | `text-foreground/80`, hover `text-foreground` |
| `border-white/15`, `border-white/10` | `border-border` or `border-foreground/15` (keep the same opacity-based feel rather than switching to the flatter `--border` token if the visual weight differs noticeably) |

**Untouched:** `hsl(var(--copper))` and `hsl(var(--signal))` accent usages (the "surveyed." emphasis, section labels like "01 / 04", "Instrument reading", "Benchmarked") — these already resolve to correct light/dark HSL values via `globals.css` and need no code change. The primary CTA buttons (`bg-primary text-primary-foreground`) are likewise already theme tokens.

**`TerrainScene`** gets the same `palette` prop plumbing as `AmbientTerrainScene` (see Architecture section) — `MARKERS`/`CAMERA_WAYPOINTS`/scroll-driven camera logic are geometry/motion, entirely palette-independent, so this is purely swapping the color inputs to `buildTerrain`/`buildParticles`/`buildMarker` and the renderer/fog clear color.

## DESIGN.md update

The paragraph at `DESIGN.md:146` ("Unlike the landing page, `/apps` is not exempted from the site's light/dark toggle... unlike the one-time public landing scroll") and the "Do" bullet at `DESIGN.md:225` ("keep the landing page's Committed intensity... exclusive to the public marketing surface" in the context of theme-exemption) get rewritten to reflect that landing is now theme-aware too. The scroll-pinned camera dolly / narrative sequence / glass panel remain landing-exclusive (that part of the Threshold Exception is unchanged — `/apps` still only gets the held-wide-shot ambient version); only the "landing ignores the toggle" claim is reversed.

## Explicitly out of scope

- Any change to the scroll-pinned camera dolly, narrative marker sequence, or glass-panel instrument device — those stay landing-exclusive per the (unchanged) rest of the Threshold Exception.
- Extending the terrain backdrop to any page beyond `/apps` and `/` (landing).
- Re-tuning the dark palette — dark mode's existing look is unchanged throughout.
- Exact final HSL values for `LIGHT_PALETTE` — pinned through in-browser visual iteration during implementation, not fully specified numerically here.

## Testing / verification

- `npx tsc --noEmit`, `npm run lint`, and the existing Vitest suite (`FixedComposerLayouts`, `CinematicAppShell`, `ApplicationDashboard`, plus any terrain-adjacent tests) must stay green.
- Manual/browser verification required (no automated 3D-rendering coverage exists): `/apps` in light and dark; `/` (landing) in light and dark, including scrolling through all panels to confirm text contrast at every segment; toggling theme live on both pages to confirm the `key`-based remount swaps the palette cleanly with no visual glitch or leaked WebGL context.
- Confirm the "3D effects disabled" fallback (simulate via reduced-motion) renders a reasonable light-mode gradient on `/apps`.
