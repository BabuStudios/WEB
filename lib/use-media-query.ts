"use client";

import { useEffect, useState } from "react";

/**
 * Returns false during SSR and on the first client render, so callers must
 * treat "false" as "not yet known" and pair this with useMounted when the
 * branch changes what gets rendered.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
