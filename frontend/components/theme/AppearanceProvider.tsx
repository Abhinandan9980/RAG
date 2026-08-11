"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  applyTheme,
  persistThemePreference,
  readThemePreference,
  type ThemePreference,
} from "@/lib/appearance";

interface AppearanceValue {
  theme: ThemePreference;
  toggleTheme(): void;
}

const AppearanceContext = createContext<AppearanceValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "dark" : readThemePreference(window.localStorage),
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemePreference = current === "dark" ? "light" : "dark";
      persistThemePreference(window.localStorage, next);
      applyTheme(document.documentElement, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceValue {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance must be used within AppearanceProvider");
  return value;
}
