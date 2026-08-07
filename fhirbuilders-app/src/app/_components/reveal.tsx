"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-in reveal that degrades safely: SSR paints the hidden state, JS reveals
// on intersection, reduced-motion reveals immediately, and a <noscript> rule in
// the layout forces full visibility with JS off. Targets sit below the fold, so
// the initial hidden paint is never seen.
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion is handled in CSS (.ed-reveal stays visible), so the only
    // state changes here are async (observer callback + timeout) — no
    // synchronous setState in the effect body.
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    // Failsafe: never leave a block hidden if the observer never fires (odd
    // viewports, non-scrolling renders, prerender/screenshot tools).
    const failsafe = window.setTimeout(() => setShown(true), 1400);
    return () => {
      obs.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`ed-reveal ${shown ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
