"use client";

import { useEffect, useState } from "react";

/** True only after the first client commit — guards SSR/client markup drift. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
