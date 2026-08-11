"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { CAPABILITIES } from "@/lib/flagship-content";

const TriangulationCinema = dynamic(
  () => import("@/components/flagship-cinema/TriangulationCinema").then((m) => m.TriangulationCinema),
  { ssr: false },
);

const STUDIO_ROUTES: Record<(typeof CAPABILITIES)[number]["id"], string> = {
  knowledge: "/chat",
  aurasql: "/aurasql",
  analysis: "/analysis",
  career: "/career",
};

const SEGMENTS = 6;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function segmentRange(index: number) {
  const start = index / SEGMENTS;
  const end = (index + 1) / SEGMENTS;
  const pad = 0.02;
  return [Math.max(0, start - pad), start + 0.03, end - 0.03, Math.min(1, end + pad)] as const;
}

function HeroPanel({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const [a, b, c, d] = segmentRange(0);
  const opacity = useTransform(scrollYProgress, [a, b, c, d], [1, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [c, d], [0, -24]);

  return (
    <motion.div style={{ opacity, y }} className="mx-auto max-w-xl text-center">
      <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
        One retrieval engine.
        <br />
        Four studios.
        <br />
        <em className="font-normal not-italic text-[hsl(var(--signal))]">No guessing.</em>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-base leading-7 text-muted-foreground">
        Watch four kinds of evidence triangulate into one cited, confidence-scored answer —
        scroll to see each studio lock in.
      </p>
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[.2em] text-muted-foreground">
        Scroll to triangulate ↓
      </p>
    </motion.div>
  );
}

function StudioPanel({
  index,
  scrollYProgress,
  side,
}: {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
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
        side === "left" ? "left-4 sm:left-10" : "right-4 sm:right-10 text-right"
      }`}
    >
      <span className="font-mono text-xs text-[hsl(var(--signal))]">
        {String(index + 1).padStart(2, "0")} / 04
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{item.name}</h2>
      <p className="mt-3 text-muted-foreground">{item.statement}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
        {item.proof.join(" · ")}
      </p>
      <Link
        href={STUDIO_ROUTES[item.id]}
        className={`pointer-events-auto mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold hover:text-[hsl(var(--signal))] ${focusRing} ${
          side === "right" ? "flex-row-reverse" : ""
        }`}
      >
        Open studio <ArrowRight aria-hidden className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

function FinalePanel({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const [a, b] = segmentRange(5);
  const opacity = useTransform(scrollYProgress, [a, b], [0, 1]);

  return (
    <motion.div style={{ opacity }} className="mx-auto max-w-lg text-center">
      <p className="font-mono text-[11px] uppercase tracking-[.2em] text-[hsl(var(--signal))]">
        Triangulated
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Four sources. One benchmark.
      </h2>
      <p className="mt-4 text-muted-foreground">
        Every studio feeds the same retrieval core — evidence stays in view, and nothing
        reaches you unscored.
      </p>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: "login" }))}
        className={`mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${focusRing}`}
      >
        Enter Keystone <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function ReducedMotionFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
        One retrieval engine. Four studios.{" "}
        <em className="font-normal not-italic text-[hsl(var(--signal))]">No guessing.</em>
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
        Every answer Keystone gives is triangulated from real sources, scored for confidence,
        and cited before it reaches you.
      </p>
      <div className="mt-16 divide-y divide-border">
        {CAPABILITIES.map((item, index) => (
          <article key={item.id} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]">
            <span className="font-mono text-sm text-[hsl(var(--signal))]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="mt-1 text-muted-foreground">{item.statement}</p>
              <Link
                href={STUDIO_ROUTES[item.id]}
                className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-[hsl(var(--signal))] ${focusRing}`}
              >
                Open studio <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CinematicSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const progressRef = useRef(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    setMounted(true);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (mounted && reducedMotion) {
    return <ReducedMotionFallback />;
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: `${SEGMENTS * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {mounted ? <TriangulationCinema progressRef={progressRef} active /> : null}
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
          <FinalePanel scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </div>
  );
}
