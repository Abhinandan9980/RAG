"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { CREATOR_PROFILE } from "@/lib/creator-profile";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CinematicManifesto() {
  return (
    <section id="manifesto" className="border-t border-border px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-2xl rounded-[2rem] bg-foreground p-8 text-background sm:p-12"
      >
        <p className="text-xl font-semibold text-[hsl(var(--invert-signal))]">An open letter</p>
        <p className="mt-6 text-lg leading-8">{CREATOR_PROFILE.ownership}</p>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-[.12em] opacity-70">
          {CREATOR_PROFILE.principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-3 border-t border-background/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm opacity-70">
            <span className="font-semibold opacity-100">{CREATOR_PROFILE.name}</span>
            {" — "}
            {CREATOR_PROFILE.role}
          </p>
          <Link
            href="/developer"
            className={`rounded-sm text-sm font-semibold text-[hsl(var(--invert-signal))] ${focusRing}`}
          >
            Read the engineering story →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
