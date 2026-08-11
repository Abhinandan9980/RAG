"use client";

import { motion, useReducedMotion } from "framer-motion";

import { StudioTile } from "@/components/platform/StudioTile";
import { useCinematicEffects } from "@/hooks/useCinematicEffects";
import type { AppManifest } from "@/lib/apps/types";
import { motionTokens } from "@/lib/motion";
import { useAuthStore } from "@/lib/store";

// One click opens a studio — no select-then-"Open workspace" two-step.
export function CinematicAppGallery({ apps }: { apps: AppManifest[] }): JSX.Element {
  const reduceMotion = useReducedMotion();
  const effects = useCinematicEffects();
  const { user } = useAuthStore();
  const animated = effects.enabled && effects.visible && !reduceMotion;
  const transition = animated ? { duration: 0.5, ease: motionTokens.ease } : { duration: 0 };

  return (
    <main
      aria-label="Application dashboard"
      className="relative min-h-[calc(100svh-2rem)] w-full overflow-hidden"
    >
      <section className="relative z-10 flex min-h-[calc(100svh-2rem)] flex-col justify-center px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <motion.div
          initial={animated ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mx-auto w-full max-w-5xl"
        >
          <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
            <span>Keystone</span>
            <span aria-hidden="true" className="h-px w-8 bg-current/50" />
            <span>{String(apps.length).padStart(2, "0")} studios</span>
          </div>
          <h1 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
            Choose an intent. Enter the system.
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {apps.map((app, index) => (
              <StudioTile app={app} authenticated={!!user} index={index} key={app.id} />
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
