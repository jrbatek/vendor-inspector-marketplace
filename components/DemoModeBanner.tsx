"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function DemoModeBanner() {
  const pathname = usePathname();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [isDemo, setIsDemo] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setIsDemo(!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsDemo(!session?.user);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (pathname === "/" || isDemo !== true) return null;

  return (
    <div className="demoBanner" role="status" aria-label="Demo mode">
      <strong>Demo Mode</strong>
      <span>You're viewing the full InspectSource experience with synthetic data.</span>
      <style jsx>{`.demoBanner{display:flex;align-items:center;justify-content:center;gap:10px;min-height:34px;padding:6px 18px;background:linear-gradient(90deg,#eff6ff,#ecfeff,#f0fdf4);border-bottom:1px solid #bfdbfe;color:#0f3b5f;font-size:.82rem;letter-spacing:.01em}.demoBanner strong{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:#1d4ed8}.demoBanner span{color:#334155}@media(max-width:640px){.demoBanner{align-items:flex-start;gap:5px;flex-direction:column;padding:8px 16px}}`}</style>
    </div>
  );
}
