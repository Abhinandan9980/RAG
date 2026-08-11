"use client";

import Link from "next/link";

import { useAuthStore } from "@/lib/store";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CinematicHeader() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/landing-v2" className={`rounded-sm font-black tracking-[.18em] ${focusRing}`}>
          KEYSTONE
        </Link>
        <nav aria-label="Cinematic landing" className="ml-auto hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <a className={`rounded-sm hover:text-foreground ${focusRing}`} href="#proof">
            Proof
          </a>
          <a className={`rounded-sm hover:text-foreground ${focusRing}`} href="#manifesto">
            Manifesto
          </a>
          <a className={`rounded-sm hover:text-foreground ${focusRing}`} href="#faq">
            FAQ
          </a>
        </nav>
        {isAuthenticated ? (
          <Link
            href="/apps"
            className={`ml-auto rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85 md:ml-0 ${focusRing}`}
          >
            Open workspace
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("keystone:auth", { detail: "login" }))}
            className={`ml-auto rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85 md:ml-0 ${focusRing}`}
          >
            Enter Keystone
          </button>
        )}
      </div>
    </header>
  );
}
