import type { ReactNode } from "react";
import DemoBackToTop from "@/components/DemoBackToTop";

// A single demo segment layout also covers every nested Client, InspectorHub,
// Agency, search, report, and detail demo route. Live pages are unaffected.
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DemoBackToTop />
    </>
  );
}
