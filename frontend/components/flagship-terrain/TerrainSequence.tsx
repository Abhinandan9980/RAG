"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { DARK_PALETTE, LIGHT_PALETTE } from "@/components/flagship-terrain/terrain-core";
import { CREATOR_PROFILE } from "@/lib/creator-profile";
import { CAPABILITIES, CAPABILITY_ROUTES, PROOF_POINTS } from "@/lib/flagship-content";
import { useCinematicEffects } from "@/hooks/useCinematicEffects";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

const TerrainScene = dynamic(
  () => import("@/components/flagship-terrain/TerrainScene").then((m) => m.TerrainScene),
  { ssr: false },
);

// Hero, 4 studios, Proof, Creator, Finale.
const SEGMENTS = 8;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Fade windows are kept entirely inside each segment's own [start, end) span
// so adjacent panels never both render at non-zero opacity at once — a
// wider pad here previously let two studio panels double-expose mid-crossfade.
function segmentRange(index: number) {
  const start = index / SEGMENTS;
  const end = (index + 1) / SEGMENTS;
  const fade = 0.02;
  return [start, Math.min(start + fade, end), Math.max(end - fade, start), end] as const;
}

// The #proof/#creator header links scroll to a plain anchor placed at a
// `top: X%` offset within this tall container — but framer-motion's
// scrollYProgress (which drives segmentRange above) maps 0→1 over
// (containerHeight - one viewport height), not the full container height,
// since progress 1 is reached once the container's bottom meets the
// viewport's bottom. A raw "segment midpoint as % of total height" anchor
// therefore lands later than the segment it's meant to target — using a
// container height of SEGMENTS·100vh here (e.g. 81.25% for Creator's segment
// 6 midpoint) actually scrolls past Creator into the Finale segment. This
// converts a target scrollYProgress into the correct container-relative
// top offset.
function anchorTopPercent(segmentIndex: number) {
  const targetProgress = (segmentIndex + 0.5) / SEGMENTS;
  const containerRelativeProgress = (targetProgress * (SEGMENTS - 1)) / SEGMENTS;
  return `${containerRelativeProgress * 100}%`;
}

type ScrollProgress = ReturnType<typeof useScroll>["scrollYProgress"];

function HeroPanel({ scrollYProgress }: { scrollYProgress: ScrollProgress }) {
  const [a, b, c, d] = segmentRange(0);
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [1, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [c, d], [0, -24]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ opacity, y }}
        className="max-w-2xl px-4 text-center sm:px-0"
      >
        <h1
          aria-label="Answers, surveyed."
          className="text-5xl font-black leading-[.95] tracking-[-.05em] text-foreground sm:text-7xl"
        >
          Answers,
          <br />
          <em className="font-normal text-[hsl(var(--copper))]">surveyed.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
          <strong className="font-semibold text-foreground">
            One retrieval engine. Four studios. No guessing.
          </strong>{" "}
          Every response is triangulated from real sources, scored for confidence, and
          benchmarked before it reaches you.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: "login" }))}
          className={`pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${focusRing}`}
        >
          Enter the workspace <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[.2em] text-muted-foreground">
          Scroll to triangulate ↓
        </p>
      </motion.div>
    </div>
  );
}

function StudioPanel({
  index,
  scrollYProgress,
  side,
}: {
  index: number;
  scrollYProgress: ScrollProgress;
  side: "left" | "right";
}) {
  const item = CAPABILITIES[index];
  const [a, b, c, d] = segmentRange(index + 1);
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [0, 1, 1, 0]);
  const x = useTransform(scrollYProgress, [a, b, c, d], [
    side === "left" ? -28 : 28,
    0,
    0,
    side === "left" ? -28 : 28,
  ]);

  return (
    <motion.div
      style={{ opacity, x }}
      className={`pointer-events-none absolute top-1/2 max-w-sm -translate-y-1/2 px-4 sm:px-0 ${
        side === "left" ? "left-4 sm:left-10" : "right-4 text-right sm:right-10"
      }`}
    >
      <span className="font-mono text-xs text-[hsl(var(--signal))]">
        {String(index + 1).padStart(2, "0")} / 04
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{item.name}</h2>
      <p className="mt-3 text-muted-foreground">{item.statement}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {item.proof.join(" · ")}
      </p>
      <Link
        href={CAPABILITY_ROUTES[item.id]}
        className={`pointer-events-auto mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground ${focusRing} ${
          side === "right" ? "flex-row-reverse" : ""
        }`}
      >
        Enter {item.name} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

function ProofPanel({ scrollYProgress }: { scrollYProgress: ScrollProgress }) {
  const [a, b, c, d] = segmentRange(5);
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [a, b], [24, 0]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ opacity, y }}
        className="max-w-2xl px-4 sm:px-0"
      >
        <p className="text-center font-mono text-[11px] uppercase tracking-[.2em] text-[hsl(var(--signal))]">
          Instrument reading
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Substance behind the surface.
        </h2>
        <dl className="mt-9 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {PROOF_POINTS.map(([term, detail]) => (
            <div key={term} className="border-t border-border pt-3">
              <dt className="font-mono text-[11px] uppercase tracking-[.14em] text-muted-foreground">{term}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-foreground/85">{detail}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}

function CreatorPanel({ scrollYProgress }: { scrollYProgress: ScrollProgress }) {
  const [a, b, c, d] = segmentRange(6);
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [a, b], [24, 0]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ opacity, y }}
        className="max-w-xl px-4 text-center sm:px-0"
      >
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-[hsl(var(--signal))]">
          The surveyor
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Built end to end by {CREATOR_PROFILE.name}
        </h2>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">{CREATOR_PROFILE.ownership}</p>
        <Link
          href="/developer"
          className={`pointer-events-auto mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-foreground/85 transition-colors hover:text-foreground ${focusRing}`}
        >
          Read the engineering story <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </div>
  );
}

function FinalePanel({ scrollYProgress }: { scrollYProgress: ScrollProgress }) {
  const [a, b] = segmentRange(7);
  const opacity = useTransform(scrollYProgress, [a, b], [0, 1]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ opacity }}
        className="max-w-lg px-4 text-center sm:px-0"
      >
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-[hsl(var(--signal))]">
          Benchmarked
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Four studios. One surveyed answer.
        </h2>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: "login" }))}
          className={`pointer-events-auto mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${focusRing}`}
        >
          Enter the workspace <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="relative isolate overflow-hidden px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1
          aria-label="Answers, surveyed."
          className="text-5xl font-black leading-[.95] tracking-[-.05em] text-foreground sm:text-7xl"
        >
          Answers,
          <br />
          <em className="font-normal text-[hsl(var(--copper))]">surveyed.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
          <strong className="font-semibold text-foreground">
            One retrieval engine. Four studios. No guessing.
          </strong>{" "}
          Every response is triangulated from real sources, scored for confidence, and
          benchmarked before it reaches you.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: "login" }))}
          className={`mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${focusRing}`}
        >
          Enter the workspace <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-auto mt-16 max-w-3xl divide-y divide-border">
        {CAPABILITIES.map((item, index) => (
          <article key={item.id} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]">
            <span className="font-mono text-sm text-[hsl(var(--signal))]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
              <p className="mt-1 text-muted-foreground">{item.statement}</p>
              <Link
                href={CAPABILITY_ROUTES[item.id]}
                className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground ${focusRing}`}
              >
                Enter {item.name} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div id="proof" className="mx-auto mt-20 max-w-2xl px-4 sm:px-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Substance behind the surface.
        </h2>
        <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {PROOF_POINTS.map(([term, detail]) => (
            <div key={term} className="border-t border-border pt-3">
              <dt className="font-mono text-[11px] uppercase tracking-[.14em] text-muted-foreground">{term}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-foreground/85">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div id="creator" className="mx-auto mt-20 max-w-2xl px-4 text-center sm:px-0">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Built end to end by {CREATOR_PROFILE.name}
        </h2>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">{CREATOR_PROFILE.ownership}</p>
        <Link
          href="/developer"
          className={`mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-foreground/85 hover:text-foreground ${focusRing}`}
        >
          Read the engineering story <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function TerrainSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const { enabled, visible } = useCinematicEffects();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // Three.js colors are imperative values baked into the scene at mount
  // time, not CSS — they can't follow the `.dark` class the way the panel
  // text/border Tailwind classes above do automatically. Reads the class
  // directly (see useResolvedTheme) rather than AppearanceProvider's
  // context, so the terrain can't drift out of sync with the class that's
  // actually driving every other themed pixel on the page.
  const resolvedTheme = useResolvedTheme();
  const palette = resolvedTheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;

  // The ref target must always mount on first render so framer-motion's
  // useScroll can attach to it — useCinematicEffects() starts as `enabled:
  // false` until its effect resolves, so the pinned/heavy branch can't be
  // the only thing that renders the ref'd element.
  return (
    <div
      id="capabilities"
      ref={containerRef}
      className="relative bg-background"
      style={enabled ? { height: `${SEGMENTS * 100}vh` } : undefined}
    >
      {enabled ? (
        <>
          {/* Static anchors for the header's /#proof and /#creator links —
              placed in the tall scrolling container's normal flow (not the
              sticky child) so anchor navigation lands near each panel's
              fully-visible midpoint. */}
          <div id="proof" aria-hidden className="absolute inset-x-0" style={{ top: anchorTopPercent(5) }} />
          <div id="creator" aria-hidden className="absolute inset-x-0" style={{ top: anchorTopPercent(6) }} />
          <div className="sticky top-0 h-screen overflow-hidden">
            <TerrainScene key={resolvedTheme} progressRef={progressRef} active={visible} palette={palette} />
            {/* The terrain's warm colorMid/colorHigh passages (unchanged from the
                original palette) sometimes run bright enough to wash out panel
                text — a soft vignette band across the mid-viewport, where every
                panel sits, holds legibility everywhere in the camera path
                without an artificial glow outlining each glyph. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 h-[64%] -translate-y-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(250,247,241,.5)_30%,rgba(250,247,241,.5)_70%,transparent_100%)] dark:bg-[linear-gradient(180deg,transparent_0%,rgba(8,12,22,.48)_30%,rgba(8,12,22,.48)_70%,transparent_100%)]"
            />
            <div className="relative flex h-full items-center justify-center">
              <HeroPanel scrollYProgress={scrollYProgress} />
              {CAPABILITIES.map((_, index) => (
                <StudioPanel
                  key={CAPABILITIES[index].id}
                  index={index}
                  scrollYProgress={scrollYProgress}
                  side={index % 2 === 0 ? "left" : "right"}
                />
              ))}
              <ProofPanel scrollYProgress={scrollYProgress} />
              <CreatorPanel scrollYProgress={scrollYProgress} />
              <FinalePanel scrollYProgress={scrollYProgress} />
            </div>
          </div>
        </>
      ) : (
        <StaticFallback />
      )}
    </div>
  );
}
