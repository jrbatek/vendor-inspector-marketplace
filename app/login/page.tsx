"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setSaving(false);
      setMessage(error?.message || "Unable to log in.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    setSaving(false);
    router.push(profile?.role === "inspector" ? "/dashboard" : "/client-dashboard");
  }

  return (
    <section className="panel authPanel">
      <p className="eyebrow">Welcome back</p>
      <h1>Login</h1>
      <form onSubmit={login}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit" disabled={saving}>{saving ? "Logging in..." : "Log in"}</button>
      </form>
      {message && <p className="notice">{message}</p>}
      <p className="muted">Need an account? <Link href="/register">Register</Link></p>
    </section>
  );
}
