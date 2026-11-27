"use client";

import { useEffect, useRef, useState } from "react";
import { createDemoBackToTopCorrection } from "@/lib/demoBackToTopCorrection";

const SCROLL_THRESHOLD = 500;

/** Demo-only floating control. Mounted by app/demo/layout.tsx, never by live routes. */
export default function DemoBackToTop() {
  const [visible, setVisible] = useState(false);
  // Retain the button node while hiding it: unmounting a focused fixed
  // control can trigger browser scroll anchoring and stop smooth keyboard scroll.
  const returningToTop = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const correction = useRef<ReturnType<typeof createDemoBackToTopCorrection> | null>(null);
  if (correction.current === null) {
    correction.current = createDemoBackToTopCorrection(
      callback => window.requestAnimationFrame(callback),
      id => window.cancelAnimationFrame(id),
    );
  }

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const atThreshold = window.scrollY >= SCROLL_THRESHOLD;
        setVisible(atThreshold || returningToTop.current);
      });
    };
    // A real user wheel/touch/pointer/scroll key interrupts the smooth return.
    // Never snap them back to the top 900ms after they resume reading.
    const cancelReturn = () => {
      // Even after the settle timer completes, a two-frame correction may
      // still be queued. A newer navigation must invalidate it as well.
      correction.current?.cancel();
      if (!returningToTop.current) return;
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
      returningToTop.current = false;
      sync();
    };
    const onScrollKey = (event: KeyboardEvent) => {
      // Tab/Enter/Escape can navigate to another demo section during the
      // 900ms settle period. That later intent must cancel the return timer.
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar", "Tab", "Enter", "Escape"].includes(event.key)) cancelReturn();
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("wheel", cancelReturn, { passive: true });
    window.addEventListener("touchstart", cancelReturn, { passive: true });
    window.addEventListener("pointerdown", cancelReturn);
    window.addEventListener("keydown", onScrollKey);
    // Browser Back/Forward and anchor navigation can happen without a pointer.
    // Never let the pending settle callback override their target position.
    window.addEventListener("hashchange", cancelReturn);
    window.addEventListener("popstate", cancelReturn);
    return () => {
      window.cancelAnimationFrame(frame);
      correction.current?.cancel();
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
      returningToTop.current = false;
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", cancelReturn);
      window.removeEventListener("touchstart", cancelReturn);
      window.removeEventListener("pointerdown", cancelReturn);
      window.removeEventListener("keydown", onScrollKey);
      window.removeEventListener("hashchange", cancelReturn);
      window.removeEventListener("popstate", cancelReturn);
    };
  }, []);

  const backToTop = () => {
    correction.current?.cancel();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    returningToTop.current = true;
    setVisible(true);
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    // A real smooth scroll is preserved. Once it has had time to settle,
    // restore keyboard focus to the page and correct late scroll anchoring.
    // The button stays mounted but becomes neither visible nor tabbable.
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      returningToTop.current = false;
      setVisible(false);
      correction.current?.schedule(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      settleTimer.current = null;
    }, reducedMotion ? 100 : 900);
  };

  return (
    <button className="demoBackToTop" type="button" aria-label="Back to top"
      aria-hidden={!visible} tabIndex={visible ? 0 : -1} data-visible={visible}
      title="Back to top" onClick={backToTop}>
      <span aria-hidden="true" className="arrow">↑</span>
      <span>Back to top</span>
      <style jsx>{`
        .demoBackToTop {
          position: fixed;
          z-index: 30;
          right: clamp(14px, 2.5vw, 32px);
          bottom: max(24px, calc(env(safe-area-inset-bottom, 0px) + 20px));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 134px;
          min-height: 48px;
          padding: 11px 16px;
          border: 2px solid #e0f2fe;
          border-radius: 999px;
          background: #103b56;
          color: #ffffff;
          box-shadow: 0 5px 18px rgba(15, 23, 42, .28);
          cursor: pointer;
          font: inherit;
          font-weight: 750;
          line-height: 1.2;
          white-space: nowrap;
        }
        .demoBackToTop[data-visible="false"] {
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
        }
        .demoBackToTop:hover { background: #075776; color: #ffffff; }
        .demoBackToTop:focus-visible {
          outline: 3px solid #facc15;
          outline-offset: 3px;
          background: #103b56;
          color: #ffffff;
        }
        .arrow { font-size: 1.2rem; line-height: 1; }
        @media (max-width: 640px) {
          .demoBackToTop {
            right: 12px;
            bottom: max(88px, calc(env(safe-area-inset-bottom, 0px) + 80px));
            min-height: 48px;
            min-width: 122px;
            padding: 10px 12px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .demoBackToTop { transition: none; }
        }
      `}</style>
    </button>
  );
}
