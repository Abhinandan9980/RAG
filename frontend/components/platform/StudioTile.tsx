"use client";

import { ArrowRight, BarChart3, BookOpen, Briefcase, Database, type LucideIcon } from "lucide-react";
import Link from "next/link";

import type { AppManifest } from "@/lib/apps/types";
import { directApplicationRoute, presentationForApp } from "@/lib/presentation/registry";

const studioIcons: Record<string, LucideIcon> = {
  "knowledge-studio": BookOpen,
  aurasql: Database,
  "data-analyst": BarChart3,
  "career-studio": Briefcase,
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// A single click target — no select-then-open two-step. Signed-in visitors
// go straight to the studio; signed-out visitors are gated behind the login
// overlay with the studio route carried through as `next`.
export function StudioTile({
  app,
  index,
  authenticated,
}: {
  app: AppManifest;
  index: number;
  authenticated: boolean;
}): JSX.Element {
  const presentation = presentationForApp(app);
  const route = directApplicationRoute(app);
  const Icon = studioIcons[app.id] ?? Database;
  const readings = [...app.required_capabilities, ...app.optional_capabilities];

  const tileClass =
    "group relative flex h-full flex-col justify-between rounded-lg border border-border/70 bg-card/80 p-6 text-left backdrop-blur-sm transition-colors hover:border-foreground/30 hover:bg-card " +
    focusRing;

  const content = (
    <>
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--signal))]">
            {String(index + 1).padStart(2, "0")} / 04
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/55 text-muted-foreground group-hover:text-foreground">
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">{presentation.shortName}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{app.summary}</p>
        {readings.length > 0 ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground/70">
            {readings.join(" · ")}
          </p>
        ) : null}
      </div>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/85 group-hover:text-foreground">
        {authenticated ? "Open workspace" : "Log in to open"}
        <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (authenticated) {
    return (
      <Link aria-label={`Open ${app.name}`} className={tileClass} href={route}>
        {content}
      </Link>
    );
  }

  return (
    <button
      aria-label={`Log in to open ${app.name}`}
      className={tileClass}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("keystone:auth", { detail: { mode: "login", next: route } }))
      }
      type="button"
    >
      {content}
    </button>
  );
}
