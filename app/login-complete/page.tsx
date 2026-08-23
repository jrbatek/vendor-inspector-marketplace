"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LoginCompletePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [message, setMessage] = useState("Completing secure sign-in...");

  useEffect(() => {
    void complete();
  }, []);

  async function complete() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setMessage("We could not complete that sign-in. Return to Login and request a new secure link.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    router.replace(profile?.role === "inspector" ? "/dashboard" : "/client-dashboard");
  }

  return <main style={{maxWidth:560,margin:"70px auto",padding:"24px",textAlign:"center"}}><h1>InspectSource</h1><p>{message}</p></main>;
}
