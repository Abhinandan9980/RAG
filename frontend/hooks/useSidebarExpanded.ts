"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "keystone.sidebar.expanded";

export function useSidebarExpanded() {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setExpanded(stored === "1");
  }, []);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return { expanded, toggle };
}
