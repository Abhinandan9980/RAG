"use client";

import dynamic from "next/dynamic";

import { useCinematicEffects } from "@/hooks/useCinematicEffects";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { DARK_PALETTE, LIGHT_PALETTE } from "@/components/flagship-terrain/terrain-core";

const AmbientTerrainScene = dynamic(
  () =>
    import("@/components/flagship-terrain/AmbientTerrainScene").then(
      (m) => m.AmbientTerrainScene,
    ),
  { ssr: false },
);

// Same instrument world as the landing sequence, held at a fixed wide shot
// instead of scroll-pinned — appropriate for a dashboard people revisit
// rather than a one-time cinematic reveal. No markers, no camera dolly.
// /apps follows the site's light/dark toggle like every other authenticated
// page, so both themes get the full terrain, just re-colored per theme's
// palette (see terrain-core's DARK_PALETTE/LIGHT_PALETTE).
export function AmbientTerrainBackdrop() {
  const { enabled, visible } = useCinematicEffects();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === "dark";
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

  return (
    <div
      aria-hidden
      className={
        isDark
          ? "fixed inset-0 -z-10 overflow-hidden bg-[#0a0f1c]"
          : "fixed inset-0 -z-10 overflow-hidden bg-[hsl(40_32%_96%)]"
      }
    >
      {enabled ? (
        <AmbientTerrainScene key={resolvedTheme} active={visible} palette={palette} />
      ) : isDark ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 20%, hsl(40 28% 22% / .35), transparent 60%), linear-gradient(180deg, hsl(222 46% 8%) 0%, hsl(222 46% 6%) 100%)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 20%, hsl(36 60% 74% / .6), transparent 60%), linear-gradient(180deg, hsl(40 32% 94%) 0%, hsl(38 28% 85%) 100%)",
          }}
        />
      )}
      <div className={`absolute inset-0 bg-noise ${isDark ? "opacity-15" : "opacity-[0.04]"} mix-blend-soft-light`} />
      {isDark ? (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(222_46%_6%/.15)_0%,hsl(222_46%_6%/.55)_75%,hsl(222_46%_6%/.85)_100%)]" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(38_30%_87%/0)_0%,hsl(38_30%_87%/.18)_75%,hsl(38_30%_87%/.32)_100%)]" />
      )}
    </div>
  );
}
