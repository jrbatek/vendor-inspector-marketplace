"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LogoutPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  useEffect(() => { supabase.auth.signOut().then(()=>router.push("/login")); }, []);
  return <p>Signing out...</p>;
}
