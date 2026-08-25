"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

const PROD_ORIGIN = "https://vendor-inspector-marketplace.vercel.app";

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("email rate")) {
    return "Too many authentication emails have been requested. Please wait a little while and try again.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "That email and password combination was not recognized. Try again, use Forgot password, or request a secure sign-in link.";
  }
  if (normalized.includes("expired") || normalized.includes("otp_expired")) {
    return "That secure sign-in link has expired. Request a new link below.";
  }
  return message;
}

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
      setMessage(friendlyAuthError(error?.message || "Unable to log in."));
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

  async function sendReset() {
    if (!email.trim()) {
      setMessage("Enter your email address first, then choose Forgot password.");
      return;
    }

    setSaving(true);
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${PROD_ORIGIN}/reset-password` });
    setSaving(false);
    setMessage(error ? friendlyAuthError(error.message) : "Password reset email sent. Check your inbox and follow the secure link.");
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setMessage("Enter your email address first, then request a sign-in link.");
      return;
    }

    setSaving(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${PROD_ORIGIN}/login-complete`, shouldCreateUser: false },
    });
    setSaving(false);
    setMessage(error ? friendlyAuthError(error.message) : "Secure sign-in link sent. Check your email to continue without a password.");
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to InspectSource</h1>
        <p className="intro">Access inspection requests, active work, reports, history and analytics.</p>
        <form onSubmit={login}>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <div className="passwordRow"><button className="textButton" type="button" onClick={() => void sendReset()} disabled={saving}>Forgot password?</button></div>
          <button className="primary" type="submit" disabled={saving}>{saving ? "Working..." : "Log in"}</button>
        </form>
        <div className="divider"><span>or</span></div>
        <button className="secondary" type="button" onClick={() => void sendMagicLink()} disabled={saving}>Email me a secure sign-in link</button>
        {message && <p className="notice">{message}</p>}
        <p className="muted">Need an account? <Link href="/register">Register</Link></p>
      </section>
      <style jsx>{`.authPage{max-width:520px;margin:0 auto;padding:60px 18px}.authCard{background:#fff;border:1px solid #dbe3ee;border-radius:18px;padding:30px;box-shadow:0 14px 40px rgba(15,23,42,.08)}.eyebrow{margin:0 0 7px;font-size:.74rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.authCard h1{margin:0}.intro,.muted{color:#64748b}.authCard form{display:grid;gap:15px;margin-top:24px}.authCard label{display:grid;gap:6px;font-weight:800}.authCard input{padding:12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}.primary,.secondary{width:100%;padding:12px;border-radius:10px;font-weight:900;cursor:pointer}.primary{border:0;background:#0f172a;color:#fff}.secondary{border:1px solid #94a3b8;background:#f8fafc;color:#0f172a}.primary:disabled,.secondary:disabled,.textButton:disabled{opacity:.65}.passwordRow{text-align:right;margin-top:-8px}.textButton{border:0;background:transparent;color:#1d4ed8;font-weight:800;cursor:pointer;padding:0}.divider{display:flex;align-items:center;gap:10px;margin:18px 0;color:#94a3b8}.divider:before,.divider:after{content:"";height:1px;background:#e2e8f0;flex:1}.notice{padding:12px;border-radius:10px;background:#eff6ff}.muted{text-align:center}`}</style>
    </main>
  );
}
