"use client";

import { useEffect, useState } from "react";

/**
 * CLAUDE.md: prefers-reduced-motion zorunlu destek. Sunucuda ve ilk
 * render'da `false` döner, mount sonrası gerçek değere geçer — hydration
 * uyumsuzluğu olmaması için.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
