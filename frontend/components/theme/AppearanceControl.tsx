"use client";

import { Moon, Sun } from "lucide-react";

import { useAppearance } from "./AppearanceProvider";

// Both icons always render; CSS (the `dark:` variant, driven by the
// already-applied `.dark` class from the inline bootstrap script) decides
// which is visible. Branching this in JS instead — swapping which icon
// mounts based on client-only theme state — hydrates mismatched, since the
// server always renders assuming the SSR default theme.
export function AppearanceControl() {
  const { toggleTheme } = useAppearance();

  return (
    <button
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={toggleTheme}
      title="Toggle theme"
      type="button"
    >
      <Sun aria-hidden className="h-4 w-4 dark:hidden" />
      <Moon aria-hidden className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
