"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

type LoginRole = "client" | "inspector";

type LoginPageProps = {
  searchParams?: {
    role?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const requestedRole: LoginRole | null =
    searchParams?.role === "client" || searchParams?.role === "inspector"
      ? searchParams.role
      : null;
  const audienceLabel = requestedRole === "client"
    ? "Client"
    : requestedRole === "inspector"
      ? "Inspector"
      : null;

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
      <p className="eyebrow">Welcome back{audienceLabel ? `, ${audienceLabel}` : ""}</p>
      <h1>{audienceLabel ? `${audienceLabel} Login` : "Login"}</h1>
      {audienceLabel && (
        <p className="muted">
          You opened the {audienceLabel.toLowerCase()} sign-in path. After authentication, InspectSource routes you according to the role on your account.
        </p>
      )}
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
