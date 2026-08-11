"use client";

import { motion } from "framer-motion";

import { PROOF_POINTS } from "@/lib/flagship-content";

export function CinematicProof() {
  return (
    <section id="proof" className="border-t border-border px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What&apos;s actually running underneath.
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {PROOF_POINTS.map(([term, detail]) => (
            <div key={term} className="bg-card p-6">
              <dt className="font-mono text-xs uppercase tracking-[.14em] text-[hsl(var(--signal))]">
                {term}
              </dt>
              <dd className="mt-2 text-foreground">{detail}</dd>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
