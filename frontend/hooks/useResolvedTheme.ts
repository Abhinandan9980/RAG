"use client";

import { useEffect, useState } from "react";

// Three.js colors are imperative values baked into a scene at mount time —
// they can't follow the `.dark` class on <html> the way CSS custom
// properties do, so anything picking a color palette by theme (the terrain
// world) needs to read the theme explicitly. Reading it off the DOM class
// directly — the same attribute applyTheme()/the bootstrap script both
// write to — rather than through AppearanceProvider's React context avoids
// any risk of the context and the actually-applied class drifting apart
// (e.g. a render that reads context before a toggle's DOM write lands).
// Defaults to "dark" until mounted, matching the SSR bootstrap default, to
// avoid a hydration mismatch.
export function useResolvedTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    read();

    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return theme;
}
