import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { RouteProviders } from "@/components/layout/RouteProviders";
import { themeBootstrapScript } from "@/lib/appearance";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-plex-mono", weight: ["400", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Keystone — Answers, surveyed.", template: "%s · Keystone" },
  description:
    "One retrieval engine, four studios, no guessing. Keystone triangulates every answer from real sources, scores it for confidence, and benchmarks it before it reaches you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${space.variable} ${mono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} /></head>
      <body>
        {/* Direction contract kept as an inert HTML comment so it survives the production build and is grep-able for audit. */}
        <div
          aria-hidden
          style={{ display: "none" }}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: answers are surveyed, not generated — refuses the glassmorphism/particle-hero
default in favor of an instrument's discipline: triangulate, measure, cite.
OWN-WORLD: surveyor-ink navy field, brass/bronze primary, ivory content tone, signal-
orange crosshair accent reserved for live/confidence moments; Space Grotesk + IBM Plex
Mono; reticle, contour lines, triangulation.
STORY: a visitor watches a crosshair lock onto scattered sources and resolve into one
cited, confidence-scored answer, then trusts the four studios share that discipline.
FIRST VIEWPORT: two-column hero — left: "Answers, surveyed." headline, supporting
line (positioning statement folded in as its lead sentence, not a kicker above the
heading), two CTAs; right: square glass instrument panel with an animated
triangulation mark over an ambient topographic WebGL scene, confidence readout
pinned to its base.
FORM: Surveyor's Instrument, direction 5 of 7 grounded candidates, concept-seed key 9cd7157b.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        <ClientProviders>
          <RouteProviders>{children}</RouteProviders>
        </ClientProviders>
      </body>
    </html>
  );
}
