/**
 * hooks/useBreakpoint.js
 * ----------------------
 * Custom hook that returns whether the current viewport is mobile-sized.
 * Uses a media query listener so it updates instantly on resize.
 *
 * Usage:
 *   const isMobile = useBreakpoint();
 */

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // px — matches common tablet/phone boundary

export function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
